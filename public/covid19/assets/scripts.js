// http://localhost:3000/covid19 PORT
$("#js-form").submit(async (event) => {
  event.preventDefault();
  $("#modalLogin").modal("toggle");
  //GET INPUTS
  const email = document.getElementById("js-input-email").value;
  const password = document.getElementById("js-input-password").value;
  //POST DATA
  const JWT = await postData(email, password);
  getCountriesTotal(JWT);
});
//POST TOKEN
const postData = async (email, password) => {
  try {
    const response = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      body: JSON.stringify({ email: email, password: password }),
    });
    const { token } = await response.json();
    localStorage.setItem("jwt-token", token);
    return token;
  } catch (err) {
    console.error(`Error: ${err}`);
  }
};
//INFO GLOBAL
const getCountriesTotal = async (jwt) => {
  try {
    const response = await fetch("http://localhost:3000/api/total", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwt} `,
      },
    });
    const { data } = await response.json();
    console.log(data);
    if (data) {
      //CHART GLOBAL
      filterCountries(data);
      //TABLE
      fillTable(data, "js-table-wrapper");
      //TOGGLE
      toggleFormAndTable("js-form-wrapper", "js-table-wrapper");
    }
  } catch (err) {
    localStorage.clear();
    console.error(`Error: ${err} `);
  }
};
//INFO LOCAL
const getCountriesLocal = async (country) => {
  try {
    const response = await fetch(
      "http://localhost:3000/api/countries/" + country,
      {
        method: "GET",
      }
    );
    const { data } = await response.json();
    if (data) {
      let dataPoints = [
        { y: data.confirmed, label: `Confirmados` },
        { y: data.deaths, label: `Muertos` },
        { y: data.recovered, label: `Recuperados` },
        { y: data.active, label: `Activos` },
      ];
      if (data) {
        $("#modalDetalle").modal("show");
        chartLocalPrint(data.location, dataPoints);
      } else {
        console.log(error);
      }
    }
  } catch (err) {
    localStorage.clear();
    console.error(`Error: ${err} `);
  }
};
//CHART FILTER
const filterCountries = (data) => {
  let countries = data;
  let moreThan = countries.filter((country) => {
    return country.confirmed > 2000000;
  });
  let countryDetail = Object.values(moreThan);
  let dataPoint1 = [];
  let dataPoint2 = [];
  countryDetail.forEach((country) => {
    dataPoint1.push({ label: country.location, y: country.confirmed });
    dataPoint2.push({ label: country.location, y: country.deaths });
  });
  chartMundial(dataPoint1, dataPoint2);
};
//TOGGLE
const toggleFormAndTable = (form, table) => {
  $(`#${form}`).toggle();
  $(`#${table}`).toggle();
  $("#chart").toggle();
};
//TABLE BODY
const fillTable = (data, table) => {
  //HEADER
  let header = `
  <table id="js-table-covid" class="table table-striped">
      <thead class="thead-dark">
      <tr>
          <th scope="col">#</th>
          <th scope="col">Locación</th>
          <th scope="col">Confirmados</th>
          <th scope="col">Activos</th>
          <th scope="col">Recuperados</th>
          <th scope="col">Muertos</th>
          <th scope="col"></th>
      </tr>
      </thead>
      <tbody>
      </tbody>
  </table>
  `;
  $(`#js-table-wrapper`).append(header);
  //BODY
  let body = "";
  $.each(data, (i, country) => {
    body += `
                <tr>
                    <th class="align-middle" scope="row"><p class="m-0">${i}</p></th>
                    <td class="align-middle"><p class="m-0">${country.location}</p></td>
                    <td class="align-middle"><p class="m-0">${country.confirmed}</p></td>
                    <td class="align-middle"><p class="m-0">${country.active}</p></td>
                    <td class="align-middle"><p class="m-0">${country.recovered}</p></td>
                    <td class="align-middle"><p class="m-0">${country.deaths}</td>
                    <td><button id="${country.location}" onclick="getCountriesLocal('${country.location}')" class="btn btn-primary boton">Ver detalle</button></td>
                </tr>
                `;
  });
  $(`#${table} tbody`).append(body);
};
//CHART MUNDIAL
const chartMundial = (dataPoint1, dataPoint2) => {
  document.getElementById(
    "main-title"
  ).innerHTML = `COVID19 - Paises con casos sobre los 2.000.000 de personas`;
  setTimeout(function () {
    var chart = new CanvasJS.Chart("chart-mundial", {
      animationEnabled: true,
      axisX: {
        labelAngle: -45,
        labelFontSize: 12,
        labelAutoFit: true,
        labelTextAlign: "center",
      },
      axisY: {
        title: "Confirmados",
        titleFontColor: "#343a40",
        lineColor: "#343a40",
        labelFontColor: "#343a40",
        tickColor: "#343a40",
      },
      axisY2: {
        title: "Muertos",
        titleFontColor: "#343a40",
        lineColor: "#343a40",
        labelFontColor: "#343a40",
        tickColor: "#343a40",
      },
      toolTip: {
        shared: true,
      },
      legend: {
        cursor: "pointer",
        itemclick: toggleDataSeries,
      },
      dataPointWidth: 10, // Thick line
      data: [
        {
          type: "column",
          color: "#F5B20F",
          name: "Confirmados",
          legendText: "Confirmados",
          showInLegend: true,
          dataPoints: dataPoint1,
        },
        {
          type: "column",
          color: "#F5380F",
          name: "Muertos",
          legendText: "Muertos",
          axisYType: "secondary",
          showInLegend: true,
          dataPoints: dataPoint2,
        },
      ],
    });
    chart.render();
    function toggleDataSeries(e) {
      if (typeof e.dataSeries.visible === "undefined" || e.dataSeries.visible) {
        e.dataSeries.visible = false;
      } else {
        e.dataSeries.visible = true;
      }
      chart.render();
    }
  }, 400);
};
//CHART LOCAL
const chartLocalPrint = (country, dataPoint) => {
  document.getElementById("country-title").innerHTML = country;
  setTimeout(function () {
    let chart = new CanvasJS.Chart("chart-country", {
      animationEnabled: true,
      theme: "light2",
      axisY: {
        includeZero: true,
      },
      data: [
        {
          type: "column",
          color: "#F5B20F",
          indexLabelFontColor: "#5A5757",
          indexLabelFontSize: 16,
          indexLabelPlacement: "outside",
          dataPoints: dataPoint,
        },
      ],
    });
    chart.render();
  }, 400);
};
