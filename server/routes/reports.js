const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// shared select fragment used by both the re-fetch and the week route
const REPORT_SELECT = `
    id,
    site_id,
    week_number,
    kits_assembled,
    funds_raised,
    volunteer_hours,
    team,
    notes,
    submitted_at,
    updated_at,
    sites (
        name,
        location
    )
`;

/**
 * Flattens the nested `sites` join object returned by Supabase
 * into top-level `site_name` and `location` fields, matching the
 * flat shape the frontend expects.
 *
 * @param {Object} row - a raw row from weekly_reports with sites join
 * @returns {Object} flattened report row
 */
const flattenReport = (row) => ({
    ...row,
    site_name: row.sites?.name ?? null,
    location: row.sites?.location ?? null,
    sites: undefined,
});

/**
 * Calls the log_weekly_report stored procedure, then re-fetches
 * the updated row so the response always reflects the current DB
 * state (accumulated totals) rather than the raw submitted values.
 *
 * The procedure performs an INSERT ... ON CONFLICT DO UPDATE (accumulate),
 * so it has no RETURNING clause — the re-fetch is required.
 *
 * @param {Object} params - validated, coerced report parameters
 * @returns {{ data: Object|null, error: string|null }}
 */
async function upsertReport(params) {
    const { siteId, weekNum, finalKits, finalFunds, finalHours, team, notes } = params;

    const { error: rpcError } = await supabase.rpc('log_weekly_report', {
        p_site_id:        siteId,
        p_week_number:    weekNum,
        p_items_collected: 0,
        p_kits_assembled: finalKits,
        p_funds_raised:   finalFunds,
        p_volunteer_hours: finalHours,
        p_team:           team ?? null,
        p_notes:          notes ?? null,
    });

    if (rpcError) {
        return { data: null, error: rpcError.message };
    }

    const { data: row, error: fetchError } = await supabase
        .from('weekly_reports')
        .select(REPORT_SELECT)
        .eq('site_id', siteId)
        .eq('week_number', weekNum)
        .single();

    if (fetchError) {
        return { data: null, error: fetchError.message };
    }

    return { data: flattenReport(row), error: null };
}


//middleware to verify the shared passcode header
const verifyPasscode = (req, res, next) => {
    const passcode = req.headers['x-passcode'];
    const expectedPasscode = process.env.SHARED_PASSCODE;

    if (!expectedPasscode) {
        console.warn('[WARNING] SHARED_PASSCODE is not set in the env variables. Allowing access by default.');
        return next();
    }

    if (passcode !== expectedPasscode) {
        return res.status(401).json({
            success: false,
            error: 'Oops! Retry Again'
        });
    }
    next();
}

// GET /api/reports - fetches all reports with site details
router.get('/', async (req, res) => {
    try {
        const { data: reports, error } = await supabase
            .from('weekly_reports')
            .select(REPORT_SELECT)
            .order('week_number', { ascending: false });

        if (error) {
            console.error('[Supabase GET reports error]:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        const formattedReports = (reports || []).map(flattenReport);

        formattedReports.sort((a, b) => {
            if (a.week_number !== b.week_number)
                return b.week_number - a.week_number;
            return (a.site_name || '').localeCompare(b.site_name || '');
        });

        res.json({
            success: true,
            count: formattedReports.length,
            data: formattedReports
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/reports - submits or updates a report
router.post('/', verifyPasscode, async (req, res) => {
    try {
        // David changes (start)
        const { site_id, week_number, kits_assembled, funds_raised,
            volunteer_hours, team, notes } = req.body;
        // David changes (end)

        //
        //check for validation
        if (!site_id || !week_number) {
            return res.status(400).json({
                success: false,
                error: 'site_id and week_number are required'
            });
        }

        // David changes (start)
        const weekNum = Number(week_number);
        if (isNaN(weekNum) || weekNum < 23 || weekNum > 32) {
            return res.status(400).json({
                success: false,
                error: 'week_number must be between 23 and 32'
            });
        }
        // David changes (end)

        // metric team validation
        const METRIC_TEAMS = [
            'Finance and Procurement',
            'Data and Impact Analytics',
            'Operations and Kit Design'
        ];

        const isMetricTeam = METRIC_TEAMS.includes(team);

        //sets the fields to zero if isMetricTeam sets to false
        const finalKits = isMetricTeam ? (kits_assembled || 0) : 0;
        const finalFunds = isMetricTeam ? (funds_raised || 0) : 0;
        const finalHours = Number(volunteer_hours || 0);

        // pre-check: does a row already exist for this site + week?
        const { data: existing, error: checkError } = await supabase
            .from('weekly_reports')
            .select('id')
            .eq('site_id', Number(site_id))
            .eq('week_number', weekNum)
            .maybeSingle();

        if (checkError) {
            console.error('[Supabase pre-check error]:', checkError);
            return res.status(500).json({ success: false, error: checkError.message });
        }

        const isUpdate = !!existing;

        const { data: result, error: upsertError } = await upsertReport({
            siteId:      Number(site_id),
            weekNum,
            finalKits,
            finalFunds,
            finalHours,
            team,
            notes,
        });

        if (upsertError) {
            console.error('[upsertReport error]:', upsertError);
            return res.status(500).json({ success: false, error: upsertError });
        }

        res.status(isUpdate ? 200 : 201).json({
            success: true,
            action: isUpdate ? 'updated' : 'created',
            data: result,
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/reports/summary - fetches summary statistics
router.get('/summary', async (req, res) => {
    try {
        //fetch all the weekly reports with the sites details
        const { data: reports, error: reportsError } = await supabase
            .from('weekly_reports')
            .select(`
                id,
                site_id,
                kits_assembled,
                funds_raised,
                volunteer_hours,
                sites(
                    name,
                    location
                )
        `);

        if (reportsError) {
            console.error('[Supabase GET summary error]:', reportsError);
            return res.status(500).json({ success: false, error: reportsError.message });
        }

        //define teh static sites list to match with the front-end seeds
        const SEEDED_SITES = [
            { id: 1, name: 'Charlotte', location: 'NC' },
            { id: 2, name: 'Auburn Hills', location: 'MI' },
            { id: 3, name: 'Miami', location: 'FL' },
            { id: 4, name: 'Houston', location: 'TX' },
            { id: 5, name: 'Itasca', location: 'IL' }
        ];

        //compare the aggregate totals
        const overall = {
            total_reports: reports ? reports.length : 0,
            total_kits: 0,
            total_funds: 0,
            total_hours: 0
        };

        if (reports) {
            reports.forEach(r => {
                overall.total_kits += Number(r.kits_assembled || 0);
                overall.total_funds += Number(r.funds_raised || 0);
                overall.total_hours += Number(r.volunteer_hours || 0);
            });
        }

        //compute the totals groups by site
        const bySite = SEEDED_SITES.map(site => {
            const siteReports = (reports || []).filter(r => r.site_id === site.id);

            const siteSummary = {
                site_name: site.name,
                location: site.location,
                report_count: siteReports.length,
                total_kits: 0,
                total_funds: 0,
                total_hours: 0
            };

            siteReports.forEach(r => {
                siteSummary.total_kits += Number(r.kits_assembled || 0);
                siteSummary.total_funds += Number(r.funds_raised || 0);
                siteSummary.total_hours += Number(r.volunteer_hours || 0);
            });

            return siteSummary;
        });

        //finally sort the site name alphabetically
        bySite.sort((a, b) => a.site_name.localeCompare(b.site_name));

        res.json({
            success: true,
            overall,
            by_site: bySite
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/reports/week/:week - fetches report by week from supabase
router.get('/week/:week', async (req, res) => {
    try {
        const weekVal = Number(req.params.week);
        if (isNaN(weekVal)) {
            return res.status(400).json({ success: false, error: 'Invalid week number parameter' });
        }

        const { data: reports, error } = await supabase
            .from('weekly_reports')
            .select(REPORT_SELECT)
            .eq('week_number', weekVal);

        if (error) {
            console.error('[Supabase GET reports by week error]:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        const formattedReports = (reports || []).map(flattenReport);

        formattedReports.sort((a, b) => {
            if (a.week_number !== b.week_number)
                return b.week_number - a.week_number;
            return (a.site_name || '').localeCompare(b.site_name || '');
        });

        res.json({
            success: true,
            count: formattedReports.length,
            data: formattedReports
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;