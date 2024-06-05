class Candidat {
    constructor(date, profile) {
        this.date = date;
        this.profile = profile;
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCandidats(profile, startDate, endDate) {
    const candidats = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const numCandidats = getRandomInt(2, 50);
        for (let i = 0; i < numCandidats; i++) {
            candidats.push(new Candidat(new Date(currentDate), profile));
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return candidats;
}

function filterCandidatsByDate(candidats, startDate, endDate) {
    return candidats.filter(candidat => candidat.date >= startDate && candidat.date <= endDate);
}

function barColor(numBars) {
    const defaultColors = [
        'rgba(2, 17, 72, 0.8)',
        'rgba(167, 213, 243, 0.8)',
        'rgba(247, 145, 12, 0.8)',
        'rgba(55, 101, 253, 0.8)',
        'rgba(55, 70, 180, 0.8)',
        'rgba(165, 175, 247, 0.8)'
    ];
    const colors = [];
    for (let i = 0; i < numBars; i++) {
        colors.push(defaultColors[i % defaultColors.length]);
    }
    return colors;
}

export { Candidat, generateCandidats, filterCandidatsByDate, barColor };
