async function getSwissTeams() {
    const response = await fetch("https://www.thesportsdb.com/api/v1/json/3/search_all_teams.php?s=Soccer&c=Switzerland");
    const data = await response.json();

    const container = document.getElementById("teams-container");
    const tableBody = document.querySelector("#teams-table tbody");

    const filteredTeams = data.teams.filter(team => {
        const capacity = parseInt(team.intStadiumCapacity);
        return !isNaN(capacity) && capacity > 10000;
    });

    container.innerHTML = '';
    tableBody.innerHTML = ''; 

    if (filteredTeams.length === 0) {
        container.innerHTML = "<p>Ez dago edukiera 10.000 baino handiagoa duen estadioko talderik.</p>";
        tableBody.innerHTML = "<tr><td colspan='3'>Ez dago daturik</td></tr>";
    } else {
        filteredTeams.forEach(team => {
            const teamDiv = document.createElement("div");
            teamDiv.classList.add("team-card");
            teamDiv.innerHTML = `
                <h3>${team.strTeam}</h3>
                <img src="${team.strBadge}" alt="${team.strTeam}" />
                <p><strong>Estadioa:</strong> ${team.strStadium}</p>
                <p><strong>Edukiera:</strong> ${team.intStadiumCapacity}</p>
            `;
            container.appendChild(teamDiv);

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${team.strTeam}</td>
                <td>${team.strStadium}</td>
                <td>${team.intStadiumCapacity}</td>
            `;
            tableBody.appendChild(tr);
        });
    }

    createCharts(data.teams);
}

function createCharts(teams) {
    const teamsWithYear = teams.filter(t => t.intFormedYear && !isNaN(parseInt(t.intFormedYear)));
    const barLabels = teamsWithYear.map(t => t.strTeam);
    const barData = teamsWithYear.map(t => parseInt(t.intFormedYear));
    const barCtx = document.getElementById('barChart').getContext('2d');
    new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: barLabels,
            datasets: [{
                label: 'Fundazio urtea',
                data: barData,
                backgroundColor: 'rgba(54, 162, 235, 0.7)'
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Taldeen Fundazio Urtea',
                    font: { size: 18, weight: 'bold' }
                },
                legend: { display: true, position: 'top' }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: { display: true, text: 'Urtea' }
                },
                x: {
                    title: { display: true, text: 'Taldeak' }
                }
            }
        }
    });

    const teamsWithCapacity = teams.filter(t => t.intStadiumCapacity && !isNaN(parseInt(t.intStadiumCapacity)));
    const lineLabels = teamsWithCapacity.map(t => t.strTeam);
    const lineData = teamsWithCapacity.map(t => parseInt(t.intStadiumCapacity));
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: lineLabels,
            datasets: [{
                label: 'Estadioaren Edukiera',
                data: lineData,
                borderColor: 'rgba(255, 99, 132, 0.7)',
                backgroundColor: 'rgba(255, 99, 132, 0.3)',
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Estadioen Edukiera Taldeka',
                    font: { size: 18, weight: 'bold' }
                },
                legend: { display: true, position: 'top' }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Edukiera' }
                },
                x: {
                    title: { display: true, text: 'Taldeak' }
                }
            }
        }
    });

    const maleCount = teams.filter(t => t.strGender === "Male").length;
    const femaleCount = teams.filter(t => t.strGender === "Female").length;
    const doughnutCtx = document.getElementById('doughnutChart').getContext('2d');
    new Chart(doughnutCtx, {
        type: 'doughnut',
        data: {
            labels: ['Gizonezkoak', 'Emakumezkoak'],
            datasets: [{
                label: 'Talde Motak',
                data: [maleCount, femaleCount],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 99, 132, 0.7)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Talde Motak (Gizonezkoak vs Emakumezkoak)',
                    font: { size: 18, weight: 'bold' }
                },
                legend: { display: true, position: 'right' }
            }
        }
    });
}

function sortuPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFontSize(18);
    doc.text("Suitzako Futbol Taldeen Txostena", pageWidth / 2, 20, { align: "center" });

    gehituGrafikoakPDF(doc, pageWidth, pageHeight);
}

function gehituGrafikoakPDF(doc, pageWidth, pageHeight) {
    const barraCanvas = document.getElementById("barChart"); 
    const lineakCanvas = document.getElementById("lineChart"); 
    const donutCanvas = document.getElementById("doughnutChart");

    if (barraCanvas) {
        const barraImg = barraCanvas.toDataURL("image/png");
        doc.addImage(barraImg, 'PNG', 10, 40, 180, 90); 
    }

    if (lineakCanvas) {
        const lineakImg = lineakCanvas.toDataURL("image/png"); 
        doc.addImage(lineakImg, 'PNG', 10, 135, 180, 90); 
    }

    if (donutCanvas) {
        const donutImg = donutCanvas.toDataURL("image/png"); 
        doc.addImage(donutImg, 'PNG', 10, 230, 90, 90); 
    }

    doc.save("Suitzako_taldeak.pdf"); 
}

getSwissTeams();
