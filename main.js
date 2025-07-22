const patientsList = document.getElementById("patientsList")

let diagnosisHistory = [] //made this a global vairiable

async function fetchData() {
    try {
        const response = await fetch(config.API_URL, {
            headers: {
                "Authorization": `Basic ${config.AUTH_HEADER}`
            }
        })
        if (!response.ok) {
            throw new Error('Network response was not ok')
        }

        const data = await response.json() // Fetch and parse the data
        renderPatients(data) // Render the patients list
        const selectedPatient = data[3]
        updateSelectedPatient(selectedPatient) // Update the UI for a selected patient

        if (selectedPatient?.diagnosis_history) {
            diagnosisHistory = selectedPatient.diagnosis_history
            renderChart(diagnosisHistory) // Generate the chart
            renderDiagnosticList(selectedPatient.diagnostic_list)
        }

        createChartInfo(diagnosisHistory)


    } catch (error) {
        console.log('Error fetching data:', error);
    }
}

function renderPatients(data) {
    data.forEach((patient, index) => {
        // Creating the list item in the left side bar dynamically
        const li = document.createElement("li")
        li.setAttribute("tabIndex", 0)

        const patientInfoDiv = document.createElement("div")
        patientInfoDiv.classList.add("patient-info")

        const image = document.createElement("img")
        image.classList.add("patient-image")
        image.setAttribute("src", patient.profile_picture)
        image.setAttribute("alt", patient.name)

        const patientDetailsDiv = document.createElement("div")
        patientDetailsDiv.classList.add("patient-details")

        const name = document.createElement("p")
        name.textContent = patient.name

        const genderAndAgeDiv = document.createElement("div")
        genderAndAgeDiv.classList.add("gender-and-age")

        const gender = document.createElement("p")
        gender.textContent = `${patient.gender},`

        const age = document.createElement("p")
        age.textContent = patient.age

        genderAndAgeDiv.append(gender, age)
        patientDetailsDiv.append(name, genderAndAgeDiv)
        patientInfoDiv.append(image, patientDetailsDiv)

        const moreIcon = document.createElement("img")
        moreIcon.setAttribute("src", "./Assets/more_horiz_FILL0_wght300_GRAD0_opsz24.svg")
        moreIcon.setAttribute("alt", "More Icon")

        li.append(patientInfoDiv, moreIcon)
        patientsList.append(li)

        li.addEventListener("click", () => {
            updateSelectedPatient(patient)
            if (patient?.diagnosis_history) {
                renderChart(patient.diagnosis_history)
                createChartInfo(patient.diagnosis_history)
                renderDiagnosticList(patient.diagnostic_list)
            }
        })
        if (index === 3) {
            li.focus()
        }
    })
}

// Rigt bar side
function updateSelectedPatient(patient) {
    const selectedPatient = document.getElementById("selectedPatient")

    //clear existing patient details
    selectedPatient.innerHTML = ""

    function createListItem(iconSrc, title, value) {
        const li = document.createElement("li")

        const img = document.createElement("img")
        img.setAttribute("src", iconSrc);
        img.setAttribute("alt", `${title} icon`)

        const detailDiv = document.createElement("div")
        detailDiv.classList.add("detail")

        const titleP = document.createElement("p")
        titleP.textContent = title

        const valueP = document.createElement("p")
        valueP.textContent = value

        detailDiv.append(titleP, valueP)
        li.append(img, detailDiv)

        selectedPatient.appendChild(li)
    }

    const avatarAndName = document.querySelector(".avatar-and-name img")
    const nameElement = document.querySelector(".avatar-and-name p")

    avatarAndName.setAttribute("src", patient.profile_picture)
    avatarAndName.setAttribute("alt", patient.name)
    nameElement.textContent = patient.name

    createListItem("./Assets/BirthIcon.svg", "Date Of Birth", patient.date_of_birth)
    createListItem("./Assets/FemaleIcon.svg", "Gender", patient.gender);
    createListItem("./Assets/PhoneIcon.svg", "Contact Info.", patient.phone_number)
    createListItem("./Assets/PhoneIcon.svg", "Emergency Contacts", patient.emergency_contact)
    createListItem("./Assets/InsuranceIcon.svg", "Insurance Provider", patient.insurance_type)

    // Lab Result
    const testNameContainer = document.getElementById("testNameContainer")

    testNameContainer.innerHTML = "";
    patient.lab_results.forEach((result) => {
        const testli = document.createElement("li")
        testli.classList.add("test")
        testli.setAttribute("tabIndex", 0);

        const testName = document.createElement("p")
        testName.textContent = result

        const downloadIcon = document.createElement("img")
        downloadIcon.setAttribute("src", "./Assets/download_FILL0_wght300_GRAD0_opsz24 (1).svg")
        downloadIcon.setAttribute("alt", "Download Icon")

        testli.append(testName, downloadIcon)
        testNameContainer.append(testli)
    })
}

// Chart container
let showAllData = false
document.addEventListener("DOMContentLoaded", () => {
    const sixMonths = document.getElementById("sixMonths")
    const showAll = document.getElementById("showAll")

    let checker = true
    showAll.addEventListener("click", (event) => {
        event.stopPropagation()
        if (checker) {
            showAllData = true
            sixMonths.textContent = "Show all diagnosis"
            showAll.textContent = "Last 6 month"
            checker = false
        } else {
            showAllData = false
            sixMonths.textContent = "Last 6 month"
            showAll.textContent = "Show all diagnosis"
            checker = true
        }

        renderChart(diagnosisHistory)
    })
})

// Chart
let chartInstance = null

function renderChart(diagnosisHistory) {
    const monthAbbreviations = {
        January: "Jan", February: "Feb", March: "Mar", April: "Apr",
        May: "May", June: "Jun", July: "Jul", August: "Aug",
        September: "Sep", October: "Oct", November: "Nov", December: "Dec"
    }

    // sort date
    diagnosisHistory.sort((a, b) => new Date(`${a.month} ${a.year}`) - new Date(`${b.month} ${b.year}`))

    const lastSixRecords = diagnosisHistory.slice(-6);

    const labels = showAllData
        ? diagnosisHistory.map(item => `${monthAbbreviations[item.month]}, ${item.year}`)
        : lastSixRecords.map(item => `${monthAbbreviations[item.month]}, ${item.year}`);


    //systolic and diastolic datasets
    const systolicValues = showAllData
        ? diagnosisHistory.map(item => item.blood_pressure.systolic.value)
        : lastSixRecords.map(item => item.blood_pressure.systolic.value);

    const diastolicValues = showAllData
        ? diagnosisHistory.map(item => item.blood_pressure.diastolic.value)
        : lastSixRecords.map(item => item.blood_pressure.diastolic.value);


    // Chart configuration
    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'Systolic',
                data: systolicValues,
                borderColor: '#C26EB4',
                backgroundColor: '#C26EB4',
                pointBorderColor: 'white',
                pointBackgroundColor: '#E66FD2',
                pointBorderWidth: 2,
                pointRadius: 8,
                borderWidth: 2.5,
                tension: 0.4,
            },
            {
                label: 'Diastolic',
                data: diastolicValues,
                borderColor: '#7E6CAB',
                backgroundColor: '#7E6CAB',
                pointBorderColor: 'white',
                pointBackgroundColor: '#8C6FE6',
                pointBorderWidth: 2,
                pointRadius: 8,
                borderWidth: 2.5,
                tension: 0.4,
            }
        ]
    }

    const chartConfig = {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: { enabled: true }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    grid: {
                        display: true
                    }
                }
            }
        }
    }

    // Render the chart
    const ctx = document.getElementById("bloodPressureChart")

    // If a chart already exists, destroy it before creating a new one
    if (chartInstance) {
        chartInstance.destroy()
    }

    chartInstance = new Chart(ctx, chartConfig)
    renderVitals(diagnosisHistory)
}


// Additional chart info
function createChartInfo(diagnosisHistory) {
    const chartInfoContainer = document.getElementById("chartInfoContainer")
    chartInfoContainer.innerHTML = "";

    // Get the latest systolic and diastolic values
    const latestRecord = diagnosisHistory[diagnosisHistory.length - 1]
    const systolic = latestRecord.blood_pressure.systolic
    const diastolic = latestRecord.blood_pressure.diastolic

    // Systolic Section
    const systolicInfo = document.createElement("div")
    systolicInfo.classList.add("chart-info")

    const systolicTitle = document.createElement("p")
    systolicTitle.textContent = "Systolic"

    const systolicValue = document.createElement("p")
    systolicValue.textContent = systolic.value

    const systolicLevels = document.createElement("p")
    const systolicSpan = document.createElement('span')
    const systolicImg = document.createElement('img')
    systolicImg.setAttribute("src", "./Assets/ArrowUp.svg")
    systolicLevels.textContent = systolic.levels

    systolicSpan.append(systolicImg)
    systolicLevels.prepend(systolicSpan)
    systolicInfo.append(systolicTitle, systolicValue, systolicLevels)

    // Divider
    const chartDivider = document.createElement("div")
    chartDivider.classList.add("chart-divider")


    // Diastolic Section
    const diastolicInfo = document.createElement("div")
    diastolicInfo.classList.add("chart-info")

    const diastolicTitle = document.createElement("p")
    diastolicTitle.setAttribute("id", "diastolic")
    diastolicTitle.textContent = "Diastolic"

    const diastolicValue = document.createElement("p")
    diastolicValue.textContent = diastolic.value

    const diastolicLevels = document.createElement("p")
    const diastolicSpan = document.createElement('span')
    const diastolicImg = document.createElement('img')
    diastolicImg.setAttribute("src", "./Assets/ArrowDown.svg")
    diastolicLevels.textContent = diastolic.levels

    diastolicSpan.append(diastolicImg)
    diastolicLevels.prepend(diastolicSpan)
    diastolicInfo.append(diastolicTitle, diastolicValue, diastolicLevels)

    chartInfoContainer.append(systolicInfo, chartDivider, diastolicInfo)
}

// Chart vitals
function renderVitals(diagnosisHistory) {
    const vitalContainer = document.getElementById("vitals")
    vitalContainer.innerHTML = "";

    // Get the latest record from diagnosis_history
    const latestRecord = diagnosisHistory[diagnosisHistory.length - 1]
    const respiratoryRate = latestRecord.respiratory_rate
    const temperature = latestRecord.temperature
    const heartRate = latestRecord.heart_rate

    // Respiratory Rate
    const respiratoryItem = document.createElement("div")
    respiratoryItem.classList.add("vital-item")

    const respiratoryImg = document.createElement("img")
    respiratoryImg.setAttribute("src", "./Assets/respiratory rate.svg")
    respiratoryImg.setAttribute("alt", "Respiratory Rate Icon")

    const respiratoryInfo = document.createElement("div")
    respiratoryInfo.classList.add("vital-info")

    const respiratoryName = document.createElement("p")
    respiratoryName.textContent = "Respiratory Rate"

    const respiratoryValue = document.createElement("p")
    respiratoryValue.textContent = `${respiratoryRate.value} bpm`

    respiratoryInfo.append(respiratoryName, respiratoryValue)

    const respiratoryLevel = document.createElement("p")
    respiratoryLevel.textContent = respiratoryRate.levels;

    respiratoryItem.append(respiratoryImg, respiratoryInfo, respiratoryLevel)
    vitalContainer.appendChild(respiratoryItem)

    // Temperature
    const temperatureItem = document.createElement("div")
    temperatureItem.classList.add("vital-item")

    const temperatureImg = document.createElement("img")
    temperatureImg.setAttribute("src", "./Assets/temperature.svg")
    temperatureImg.setAttribute("alt", "Temperature Icon")

    const temperatureInfo = document.createElement("div")
    temperatureInfo.classList.add("vital-info")

    const temperatureName = document.createElement("p")
    temperatureName.textContent = "Temperature"

    const temperatureValue = document.createElement("p")
    temperatureValue.textContent = `${temperature.value}°F`

    temperatureInfo.append(temperatureName, temperatureValue)

    const temperatureLevel = document.createElement("p")
    temperatureLevel.textContent = temperature.levels;

    temperatureItem.append(temperatureImg, temperatureInfo, temperatureLevel)
    vitalContainer.appendChild(temperatureItem)

    // Heart Rate
    const heartRateItem = document.createElement("div")
    heartRateItem.classList.add("vital-item")

    const heartRateImg = document.createElement("img")
    heartRateImg.setAttribute("src", "./Assets/HeartBPM.svg")
    heartRateImg.setAttribute("alt", "Heart Rate Icon")

    const heartRateInfo = document.createElement("div")
    heartRateInfo.classList.add("vital-info")

    const heartRateName = document.createElement("p")
    heartRateName.textContent = "Heart Rate"

    const heartRateValue = document.createElement("p")
    heartRateValue.textContent = `${heartRate.value} bpm`

    heartRateInfo.append(heartRateName, heartRateValue)

    const heartRateLevel = document.createElement("p")
    heartRateLevel.innerHTML = `<span><img src="./Assets/ArrowDown.svg" alt="Arrow"></span> ${heartRate.levels}`

    heartRateItem.append(heartRateImg, heartRateInfo, heartRateLevel)
    vitalContainer.appendChild(heartRateItem)
}

// Diagnostic List

function renderDiagnosticList(diagnosticList) {
    const tableBody = document.getElementById("tableBody")
    tableBody.innerHTML = "";

    diagnosticList.forEach(item => {
        const bodyRow = document.createElement("tr")

        const name = document.createElement("td")
        name.textContent = item.name
        const description = document.createElement("td")
        description.textContent = item.description
        const status = document.createElement("td")
        status.textContent = item.status

        bodyRow.append(name, description, status)
        tableBody.appendChild(bodyRow)
    })
}

fetchData();
