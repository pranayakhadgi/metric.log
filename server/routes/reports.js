const express = require('express');
const router  = express.Router();
const db = require('../db');

// GET /api/reports - fetches all reports with site details
router.get('/', (req, res) => {
    try {
        const reports = db.prepare(`
            SELECT
                r.id,
                r.site_id,
                s.name as site_name,
                s.location,
                r.week_number,
                r.items_collected,
                r.kits_assembled,
                r.funds_raised,
                r.volunteer_hours,
                r.team,
                r.notes,
                r.submitted_at,
                r.updated_at
            FROM weekly_reports r
            JOIN sites s ON r.site_id = s.id
            ORDER BY r.week_number DESC, s.name ASC`).all();

            res.json({
                success: true,
                count: reports.length,
                data: reports
            });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message});
    }
});

// POST /api/reports - submits or updates a report
router.post('/', (req, res) => {
    try {
        // David changes (start)
        const { site_id, week_number, items_collected, kits_assembled, funds_raised,
            volunteer_hours, team, notes } = req.body;
        // David changes (end)

        //check for validation
        if(!site_id || !week_number) {
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

        // David changes (start)
        const stmt = db.prepare(`
            INSERT INTO weekly_reports (site_id, week_number, items_collected,
            kits_assembled, funds_raised, volunteer_hours, team, notes)
            VALUES (?, ?, COALESCE(?, 0), COALESCE(?, 0), COALESCE(?, 0), COALESCE(?, 0), ?, ?)
            ON CONFLICT(site_id, week_number)
            DO UPDATE SET
                items_collected = excluded.items_collected,
                kits_assembled = excluded.kits_assembled,
                funds_raised = excluded.funds_raised,
                volunteer_hours = excluded.volunteer_hours,
                team = excluded.team,
                notes = excluded.notes,
                updated_at = CURRENT_TIMESTAMP
                RETURNING *
        `);

        const result = stmt.get(
            site_id, week_number, items_collected, kits_assembled,
            funds_raised, volunteer_hours, team || null, notes || null
        );
        // David changes (end)

        const isUpdate = result.submitted_at !== result.updated_at;

        res.status(isUpdate ? 200: 201).json({
            success: true,
            action: isUpdate ? 'updated' : 'created', data: result
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/reports/summary - fetches summary statistics
router.get('/summary', (req, res) => {
    try {
        const overall = db.prepare(`
            SELECT
                COUNT(*) as total_reports,
                SUM(items_collected) as total_items,
                SUM(kits_assembled) as total_kits,
                SUM(funds_raised) as total_funds,
                SUM(volunteer_hours) as total_hours
            FROM weekly_reports
        `).get();

        const bySite = db.prepare(`
            SELECT
                s.name as site_name,
                s.location,
                COUNT(r.id) as report_count,
                SUM(r.items_collected) as total_items,
                SUM(r.kits_assembled) as total_kits,
                SUM(r.funds_raised) as total_funds,
                SUM(r.volunteer_hours) as total_hours
            FROM sites s
            LEFT JOIN weekly_reports r ON s.id = r.site_id
            GROUP BY s.id
            ORDER BY s.name
        `).all();

        res.json({
            success: true,
            overall,
            by_site: bySite
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/reports/week/ :week - fetches report by week
router.get('/week/:week', (req, res) => {
    try {
        const reports = db.prepare(`
            SELECT r.*, s.name as site_name, s.location
                FROM weekly_reports r
                JOIN sites s ON r.site_id = s.id
                WHERE r.week_number = ?
                ORDER BY s.name
                `).all(req.params.week);
        res.json({ success: true, count: reports.length, data: reports});
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;