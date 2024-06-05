import { generateCandidats } from './data.js';

export let selectedProfiles = [];
export let candidats = [];

export function addProfile(startDate, endDate) {
    const profileName = document.getElementById('profile-name').value.trim();
    const profileError = document.getElementById('profile-error');
    if (profileName && !selectedProfiles.includes(profileName)) {
        const newCandidats = generateCandidats(profileName, startDate, endDate);
        candidats.push(...newCandidats);
        selectedProfiles.push(profileName);
        const checkbox = document.createElement('label');
        checkbox.innerHTML = `<input type="checkbox" value="${profileName}" class="profile-checkbox" checked> ${profileName}<br>`;
        document.getElementById('profile-checkboxes').appendChild(checkbox);
        profileError.style.display = 'none';
        // Add change event listener to update selectedProfiles
        checkbox.querySelector('input').addEventListener('change', function() {
            selectedProfiles = handleProfileCheckboxChange();
        });
    } else {
        profileError.style.display = 'block';
    }
}

export function removeProfile() {
    const profileName = document.getElementById('profile-name').value.trim();
    if (profileName && selectedProfiles.includes(profileName)) {
        candidats = candidats.filter(candidat => candidat.profile !== profileName);
        selectedProfiles = selectedProfiles.filter(profile => profile !== profileName);
        const checkbox = document.querySelector(`#profile-checkboxes input[value="${profileName}"]`).parentNode;
        document.getElementById('profile-checkboxes').removeChild(checkbox);
    }
}

export function handleProfileCheckboxChange() {
    return Array.from(document.querySelectorAll('#profile-checkboxes input:checked')).map(input => input.value);
}
