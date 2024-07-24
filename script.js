document.addEventListener("DOMContentLoaded", function () {
  const hamburgerMenu = document.querySelector(".hamburger-menu");
  const menu = document.querySelector(".menu");

  // Toggle menu on hamburger click
  hamburgerMenu.addEventListener("click", function () {
    menu.classList.toggle("active");
  });

  // Smooth scroll and close menu on link click
  const menuLinks = document.querySelectorAll(".menu a");
  menuLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();

      const targetId = this.getAttribute("href");
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: "smooth",
        });

        menu.classList.remove("active");
      }
    });
  });

  // Close menu on clicking outside
  document.addEventListener("click", function (event) {
    const targetElement = event.target;

    if (!targetElement.closest(".menu") && !targetElement.closest(".hamburger-menu")) {
      if (menu.classList.contains("active")) {
        menu.classList.remove("active");
      }
    }
  });

  // Glossary item toggle
  const glossaryItems = document.querySelectorAll(".glossary-item");
  glossaryItems.forEach(function (item) {
    const header = item.querySelector("header");
    const content = item.querySelector(".content");

    header.addEventListener("click", function () {
      content.classList.toggle("active");
    });
  });
  // Fetch and process data after DOM content is loaded
  fetchAndProcessData();
});

window.addEventListener("scroll", () => {
  const text = document.getElementById("text");
  const awankiri = document.getElementById("awankiri");
  const awankanan = document.getElementById("awankanan");
  const kotakiri = document.getElementById("kotakiri");
  const kotakanan = document.getElementById("kotakanan");

  const value = window.scrollY;

  const newMarginTop = Math.min(50 + value * 1.2, 350);
  text.style.marginTop = newMarginTop + "px";

  awankiri.style.top = value * -1.5 + "px";
  awankiri.style.left = value * -2.5 + "px";

  awankanan.style.top = value * -1.5 + "px";
  awankanan.style.left = value * 2.5 + "px";

  kotakiri.style.left = value * -2.5 + "px";

  kotakanan.style.left = value * 2.5 + "px";
});

function fetchAndProcessData() {
  fetch("nycdata.json")
    .then((response) => response.json())
    .then((data) => {
      // Initialize DataTable
      const dataTable = $("#dataTable").DataTable();

      // Variables for Chart.js
      const neighborhoods = [];
      const salePrices = [];
      const grossSquareFeet = [];

      // Populate DataTable and prepare data for Chart.js
      data.forEach((item) => {
        dataTable.row
          .add([
            item.BOROUGH,
            item.NEIGHBORHOOD,
            item.BUILDING_CLASS_CATEGORY,
            item.TAX_CLASS_AT_PRESENT,
            item.BUILDING_CLASS_AT_PRESENT,
            item.LAND_SQUARE_FEET,
            item.GROSS_SQUARE_FEET,
            item.YEAR_BUILT,
            item.TAX_CLASS_AT_TIME_OF_SALE,
            item.BUILDING_CLASS_AT_TIME_OF_SALE,
            item.SALE_PRICE,
            item.SALE_DATE,
          ])
          .draw();

        neighborhoods.push(item.NEIGHBORHOOD);
        salePrices.push(item.SALE_PRICE);
        grossSquareFeet.push(item.GROSS_SQUARE_FEET);
      });

      // Function to update charts
      function updateCharts() {
        const selectedBoroughs = Array.from(document.querySelectorAll("#boroughFilter input:checked")).map((checkbox) => checkbox.value);
        const selectedBuildingClasses = Array.from(document.querySelectorAll("#buildingClassFilter input:checked")).map((checkbox) => checkbox.value);

        const filteredData = data.filter(
          (item) => (selectedBoroughs.length === 0 || selectedBoroughs.includes(item.BOROUGH.toString())) && (selectedBuildingClasses.length === 0 || selectedBuildingClasses.includes(item.BUILDING_CLASS_CATEGORY))
        );

        // Update total sales, average sale price, average building area, average land area
        const totalPenjualan = filteredData.reduce((sum, item) => sum + item.SALE_PRICE, 0);
        document.getElementById("totalPenjualan").textContent = totalPenjualan.toLocaleString();

        const rataRataHargaPenjualan = totalPenjualan / filteredData.length;
        document.getElementById("rataRataHargaPenjualan").textContent = rataRataHargaPenjualan.toLocaleString();

        const totalLuasBangunan = filteredData.reduce((sum, item) => sum + item.GROSS_SQUARE_FEET, 0);
        const rataRataLuasBangunan = totalLuasBangunan / filteredData.length;
        document.getElementById("rataRataLuasBangunan").textContent = rataRataLuasBangunan.toLocaleString();

        const totalLuasTanah = filteredData.reduce((sum, item) => sum + item.LAND_SQUARE_FEET, 0);
        const rataRataLuasTanah = totalLuasTanah / filteredData.length;
        document.getElementById("rataRataLuasTanah").textContent = rataRataLuasTanah.toLocaleString();

        // Update line chart for average land and building area over time
        const boroughs = [...new Set(filteredData.map((item) => item.BOROUGH))];
        lineAreaChart.data.labels = boroughs;
        lineAreaChart.data.datasets[0].data = boroughs.map(
          (borough) => filteredData.filter((item) => item.BOROUGH === borough).reduce((sum, item) => sum + item.LAND_SQUARE_FEET, 0) / filteredData.filter((item) => item.BOROUGH === borough).length
        );
        lineAreaChart.data.datasets[1].data = boroughs.map(
          (borough) => filteredData.filter((item) => item.BOROUGH === borough).reduce((sum, item) => sum + item.GROSS_SQUARE_FEET, 0) / filteredData.filter((item) => item.BOROUGH === borough).length
        );
        lineAreaChart.update();

        // Update horizontal bar chart for land and building area by building type
        const buildingClasses = [...new Set(filteredData.map((item) => item.BUILDING_CLASS_CATEGORY))];
        horizontalBarChart.data.labels = buildingClasses;
        horizontalBarChart.data.datasets[0].data = buildingClasses.map(
          (type) => filteredData.filter((item) => item.BUILDING_CLASS_CATEGORY === type).reduce((sum, item) => sum + item.LAND_SQUARE_FEET, 0) / filteredData.filter((item) => item.BUILDING_CLASS_CATEGORY === type).length
        );
        horizontalBarChart.data.datasets[1].data = buildingClasses.map(
          (type) => filteredData.filter((item) => item.BUILDING_CLASS_CATEGORY === type).reduce((sum, item) => sum + item.GROSS_SQUARE_FEET, 0) / filteredData.filter((item) => item.BUILDING_CLASS_CATEGORY === type).length
        );
        horizontalBarChart.update();

        // Update pie chart for sales distribution by borough
        const boroughSales = boroughs.map((borough) => filteredData.filter((item) => item.BOROUGH === borough).reduce((sum, item) => sum + item.SALE_PRICE, 0));

        pieChart.data.labels = boroughs;
        pieChart.data.datasets[0].data = boroughSales;
        pieChart.update();

        // Update monthly sales trend chart
        const months = [...new Set(filteredData.map((item) => item.SALE_DATE.slice(0, 7)))].sort();
        const monthlySales = months.map((month) => filteredData.filter((item) => item.SALE_DATE.slice(0, 7) === month).reduce((sum, item) => sum + item.SALE_PRICE, 0));

        monthlySalesChart.data.labels = months;
        monthlySalesChart.data.datasets[0].data = monthlySales;
        monthlySalesChart.update();
      }

      // Line chart for average land and building area over time
      const lineAreaCtx = document.getElementById("lineAreaChart");
      const lineAreaChart = new Chart(lineAreaCtx, {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              label: "GROSS SQUARE FEET",
              data: [],
              borderColor: "rgb(255, 99, 132)",
              backgroundColor: "rgba(255, 99, 132, 0.5)",
            },
            {
              label: "LAND SQUARE FEET",
              data: [],
              borderColor: "rgb(53, 162, 235)",
              backgroundColor: "rgba(53, 162, 235, 0.5)",
            },
          ],
        },
        options: {
          scales: {
            x: {
              title: {
                display: true,
                text: "Borough",
              },
            },
            y: {
              title: {
                display: true,
                text: "Square Feet",
              },
              beginAtZero: true,
            },
          },
        },
      });

      // Horizontal bar chart for land and building area by building type
      const horizontalBarCtx = document.getElementById("horizontalBarChart").getContext("2d");
      const horizontalBarChart = new Chart(horizontalBarCtx, {
        type: "bar",
        data: {
          labels: [],
          datasets: [
            {
              label: "Gross Square Feet",
              data: [],
              backgroundColor: "rgba(255, 99, 132, 0.5)",
            },
            {
              label: "Land Square Feet",
              data: [],
              backgroundColor: "rgba(53, 162, 235, 0.5)",
            },
          ],
        },
        options: {
          indexAxis: "y",
          scales: {
            x: {
              title: {
                display: true,
                text: "Square Feet",
              },
              beginAtZero: true,
            },
            y: {
              title: {
                display: true,
                text: "Building Class",
              },
            },
          },
        },
      });

      // Pie chart for sales distribution by borough
      const pieCtx = document.getElementById("pieChart").getContext("2d");
      const pieChart = new Chart(pieCtx, {
        type: "pie",
        data: {
          labels: [],
          datasets: [
            {
              data: [],
              backgroundColor: ["rgba(255, 99, 132, 0.8)", "rgba(54, 162, 235, 0.8)", "rgba(255, 206, 86, 0.8)", "rgba(75, 192, 192, 0.8)", "rgba(153, 102, 255, 0.8)"],
            },
          ],
        },
        options: {
          responsive: true,
        },
      });

      // Monthly sales trend chart
      const monthlySalesCtx = document.getElementById("monthlySalesChart").getContext("2d");
      const monthlySalesChart = new Chart(monthlySalesCtx, {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              label: "Monthly Sales",
              data: [],
              borderColor: "rgb(54, 162, 235)",
              backgroundColor: "rgba(54, 162, 235, 0.5)",
              fill: true,
            },
          ],
        },
        options: {
          scales: {
            x: {
              title: {
                display: true,
                text: "Month",
              },
            },
            y: {
              title: {
                display: true,
                text: "Sales Amount",
              },
              beginAtZero: true,
            },
          },
        },
      });

      // Call updateCharts to populate the charts with data
      updateCharts();
    });
}
