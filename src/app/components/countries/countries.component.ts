import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { GlobalDataSummary } from 'src/app/modals/global-data';
import { DateWiseData } from 'src/app/modals/date-wise-data';
import { merge } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-countries',
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.css'],
  providers: [DataService]
})
export class CountriesComponent implements OnInit {

  data: any = [];
  countries: string[] = [];
  totalConfirmed = 0;
  totalActive = 0;
  totalDeaths = 0;
  totalRecovered = 0;
  selectedCountryData: DateWiseData[];
  dateWiseData ;
  dataTable = [];
  loading = true;
  chart = {
    LineChart: 'LineChart',
    height: 500,
    options: {
      animation: {
        duration: 1000,
        easing: 'out'
      },
      backgroundColor: '#f1f8e9'
    }
  };
  constructor(private dataService: DataService) { }

  ngOnInit() {

   // tslint:disable-next-line: deprecation
   merge(
     this.dataService.getDateWiseData().pipe(
       map(result => {
         this.dateWiseData = result;
       })
     ),
     this.dataService.getGlobalData().pipe(
       map(result => {
         this.data = result;
         this.data.forEach(cs => {
           this.countries.push(cs.country);
         });
       }))).subscribe(
         {
     complete: () => {
       this.updateValues('US');
       this.loading = false;
     }
   }
   );
  }

  updateChart() {
    this.dataTable = [];
    this.selectedCountryData.forEach(cs => {
      this.dataTable.push([cs.date, cs.cases]);
    });
  }

  updateValues(country: string) {
    console.log(country);
    this.data.forEach(cs => {
      if (cs.country === country) {
        this.totalActive = cs.active;
        this.totalRecovered = cs.recovered;
        this.totalDeaths = cs.deaths;
        this.totalConfirmed = cs.confirmed;
      }
    });

    this.selectedCountryData = this.dateWiseData[country];
    this.updateChart();
  }

}
