import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { GlobalDataSummary } from 'src/app/modals/global-data';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [DataService]
})
export class HomeComponent implements OnInit {

  totalConfirmed = 0;
  totalActive = 0;
  totalDeaths = 0;
  totalRecovered = 0;
  loading = true;

  globalData: GlobalDataSummary[];
  datatable = [];
  chart = {
    PieChart: 'PieChart',
    ColumnChart: 'ColumnChart',
    height: 500,
    options: {
      animation: {
        duration: 1000,
        easing: 'in'
      },
      is3D: true,
      backgroundColor: '#f1f8e9'
    }
  };

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.dataService.getGlobalData()
    .subscribe({
      next: (result) => {
        this.globalData = result;
        result.forEach(cs => {
          if (!Number.isNaN(cs.confirmed)) {

          this.totalActive += cs.active;
          this.totalConfirmed += cs.confirmed;
          this.totalDeaths += cs.deaths;
          this.totalRecovered += cs.recovered;

          }
        });
        this.initChart('confirm');
      },
      complete : () => {
        this.loading = false;
      }
    });
  }

  updateChart(input: HTMLInputElement) {
    this.initChart(input.value);
  }

  initChart(caseType: string) {

    this.datatable = [];


    this.globalData.forEach(cs => {
      let value: number;
      if (caseType === 'confirm') {
        if (cs.confirmed > 10000) {
          value = cs.confirmed;
        }
      }

      if (caseType === 'active') {
        if (cs.active > 10000) {
          value = cs.active;
        }
      }

      if (caseType === 'death') {
        if (cs.deaths > 1000) {
          value = cs.deaths;
        }
      }

      if (caseType === 'recover') {
        if (cs.recovered > 10000) {
            value = cs.recovered;
        }
      }


      if (value) {
          this.datatable.push([
           cs.country , value
          ]);
        }
    });
  }


  }

