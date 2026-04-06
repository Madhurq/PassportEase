const express = require('express');

const router = express.Router();

// Mock PSK locations (public endpoint - no auth required)
router.get('/locations', (req, res) => {
    res.json({
        locations: [
            { id: 'psk_del_1', name: 'PSK Delhi - ITO', address: 'ITO, New Delhi', distance: 5 },
            { id: 'psk_del_2', name: 'PSK Delhi - Shalimar Bagh', address: 'Shalimar Bagh, New Delhi', distance: 8 },
            { id: 'psk_mum_1', name: 'PSK Mumbai - Andheri', address: 'Andheri East, Mumbai', distance: 3 },
            { id: 'psk_mum_2', name: 'PSK Mumbai - Malad', address: 'Malad West, Mumbai', distance: 6 },
            { id: 'psk_blr_1', name: 'PSK Bangalore - Lalbagh', address: 'Lalbagh Road, Bangalore', distance: 4 },
            { id: 'psk_blr_2', name: 'PSK Bangalore - Marathahalli', address: 'Marathahalli, Bangalore', distance: 7 },
            { id: 'psk_chn_1', name: 'PSK Chennai - Anna Nagar', address: 'Anna Nagar, Chennai', distance: 5 },
            { id: 'psk_hyd_1', name: 'PSK Hyderabad - Ameerpet', address: 'Ameerpet, Hyderabad', distance: 4 }
        ]
    });
});

// Mock slots for a location
router.get('/slots/:location', (req, res) => {
    const { location } = req.params;

    const dates = Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i + 1);
        while (d.getDay() === 0 || d.getDay() === 6) {
            d.setDate(d.getDate() + 1);
        }
        return d.toISOString().split('T')[0];
    });

    const slots = dates.flatMap(date => [
        { date, time: '09:30 AM', available: Math.random() > 0.3 },
        { date, time: '11:00 AM', available: Math.random() > 0.3 },
        { date, time: '02:00 PM', available: Math.random() > 0.3 },
        { date, time: '03:30 PM', available: Math.random() > 0.3 }
    ]).filter(slot => slot.available);

    res.json({ location, slots });
});

module.exports = router;