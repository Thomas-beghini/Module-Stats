export function handleStartDateChange(value) {
    return new Date(value);
}

export function handleEndDateChange(value) {
    return new Date(value);
}

export function generateTimeIntervals(startDate, endDate, interval) {
    const intervals = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        let label;
        let nextDate = new Date(currentDate);

        if (interval === 'daily') {
            label = currentDate.toLocaleDateString();
            nextDate.setDate(currentDate.getDate() + 1);
        } else if (interval === 'weekly') {
            label = `Semaine du ${currentDate.toLocaleDateString()}`;
            nextDate.setDate(currentDate.getDate() + 7);
        } else if (interval === 'monthly') {
            label = currentDate.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
            nextDate.setMonth(currentDate.getMonth() + 1);
        } else if (interval === 'quarterly') {
            const quarter = Math.floor((currentDate.getMonth() + 3) / 3);
            label = `Q${quarter} ${currentDate.getFullYear()}`;
            nextDate.setMonth(currentDate.getMonth() + 3);
        }

        intervals.push({ label, start: new Date(currentDate), end: new Date(nextDate) });
        currentDate = nextDate;
    }

    return intervals;
}

export function groupCandidatsByInterval(candidats, intervals, selectedProfiles) {
    const groupedData = {};
    intervals.forEach(({ label }) => {
        groupedData[label] = {};
        selectedProfiles.forEach(profile => {
            groupedData[label][profile] = 0;
        });
    });

    candidats.forEach(candidat => {
        intervals.forEach(({ label, start, end }) => {
            if (candidat.date >= start && candidat.date < end) {
                groupedData[label][candidat.profile]++;
            }
        });
    });

    return groupedData;
}
