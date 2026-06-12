const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// GET /api/reports - fetches all reports with site details
router.get('/', async (req, res) => {
    try {
        const { data: reports, error } = await supabase
            .from('weekly_reports')
            .select(`
                id,
                site_id,
                week_number,
                items_collected,
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
            `)
            .order('week_number', { ascending: false });

        if (error) {
            console.error('[Supabase GET reports error]:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        // redner the map nested sites into a flat dashboard structure -- better for frontend compatibility
        const formattedReports = (reports || []).map(r => ({
            ...r,
            site_name: r.sites?.name || null,
            location: r.sites?.location || null,
            sites: undefined // removes the nested obj to match with sqlite format
        }));

        //sorts the field by site name ascending as a secondary sort key to match sqlite format
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
router.post('/', async (req, res) => {
    try {
        // David changes (start)
        const { site_id, week_number, items_collected, kits_assembled, funds_raised,
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
            'Data and Impact Analysis',
            'Operations and Kit Design'
        ];

        const isMetricTeam = METRIC_TEAMS.includes(team);

        //sets the fields to zero if isMetricTeam sets to false
        const finalItems = isMetricTeam ? (items_collected || 0) : 0;
        const finalKits = isMetricTeam ? (kits_assembled || 0) : 0;
        const finalFunds = isMetricTeam ? (funds_raised || 0) : 0;
        const finalHours = Number(volunteer_hours || 0);

        //upserting on columns will do the insert or update rows
        const { data, error } = await supabase.from('weekly_reports').upsert({
            site_id: Number(site_id),
            week_number: weekNum,
            items_collected: finalItems,
            kits_assembled: finalKits,
            funds_raised: finalFunds,
            volunteer_hours: finalHours,
            team: team || null,
            notes: notes || null,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'site_id,week_number'
        }).select();

        if (error) {
            console.error('[Supabase Error]:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        const result = data[0];

        const isUpdate = result.submitted_at !== result.updated_at;

        res.status(isUpdate ? 200 : 201).json({
            success: true,
            action: isUpdate ? 'updated' : 'created', data: result
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
                items_collected,
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
            total_items: 0,
            total_kits: 0,
            total_funds: 0,
            total_hours: 0
        };

        if (reports) {
            reports.forEach(r => {
                overall.total_items += Number(r.items_collected || 0);
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
                total_items: 0,
                total_kits: 0,
                total_funds: 0,
                total_hours: 0
            };

            siteReports.forEach(r => {
                siteSummary.total_items += Number(r.items_collected || 0);
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

// GET /api/reports/week/ :week - fetches report by week from supabase
router.get('/week/:week', async (req, res) => {
    try {
        const weekVal = Number(req.params.week);
        if (isNaN(weekVal)) {
            return res.status(400).json({ sucess: false, error: 'Invalid week number parameter' });
        }

        // Fetch data from Supabase
        const { data: reports, error } = await supabase
            .from('weekly_reports')
            .select(`
                id,
                site_id,
                week_number,
                items_collected,
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
            `)
            .eq('week_number', weekVal);

        if (error) {
            console.error('[Supabase GET reports by week error]:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        // redner the map nested sites into a flat dashboard structure -- better for frontend compatibility
        const formattedReports = (reports || []).map(r => ({
            ...r,
            site_name: r.sites?.name || null,
            location: r.sites?.location || null,
            sites: undefined // removes the nested obj to match with sqlite format
        }));

        //sorts the field by site name ascending as a secondary sort key to match sqlite format
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