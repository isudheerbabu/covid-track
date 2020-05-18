import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { GlobalDataSummary } from '../modals/global-data';
import { DateWiseData } from '../modals/date-wise-data';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  // tslint:disable-next-line:max-line-length
  private baseUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/';
  private globalDataURL = '';
  private extension = '.csv';
  // tslint:disable-next-line:max-line-length
  private dateWiseDataURL = `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv`;

  month;
  date;
  year;

  getDate(date: number) {
    if (date < 10) {
      return '0' + date;
    }
    return date;
  }
  constructor(private http: HttpClient) {
    const now = new Date();
    this.month = now.getMonth() + 1;
    this.year = now.getFullYear();
    this.date = now.getDate();

    this.globalDataURL = `${this.baseUrl}${this.getDate(this.month)}-${this.date}-${this.year}${this.extension}`;
   }

  getDateWiseData() {
    return this.http.get(this.dateWiseDataURL, { responseType: 'text'})
    .pipe(map(result => {
      const rows = result.split('\n');

      const mainData = {};
      const header = rows[0];
      const dates = header.split(/,(?=\S)/);
      dates.splice(0, 4);
      rows.splice(0, 1);

      rows.forEach(row => {
        const cols = row.split(/,(?=\S)/);
        const con = cols[1];
        cols.splice(0, 4);
        mainData[con] = [];
        cols.forEach((value, index) => {
          const dw: DateWiseData = {
            cases: +value,
            country: con,
            date: new Date(Date.parse(dates[index]))
          };
          mainData[con].push(dw);
        });
      });


      return mainData;
    }));
  }

  getGlobalData() {
    return this.http.get(this.globalDataURL, { responseType: 'text'}).pipe(
      map(result => {
        const data: GlobalDataSummary[] = [];
        const raw = {};
        const rows = result.split('\n');
        rows.splice(0, 1);
        rows.forEach(row => {
          const cols = row.split(/,(?=\S)/);
          const cs = {
            country: cols[3],
            confirmed: +cols[7],
            deaths: +cols[8],
            recovered: +cols[9],
            active: +cols[10]
          };
          const temp: GlobalDataSummary = raw[cs.country];
          if (temp) {
            temp.active = cs.active + temp.active;
            temp.confirmed = cs.confirmed + temp.confirmed;
            temp.deaths = cs.deaths + temp.deaths;
            temp.recovered = cs.recovered + temp.recovered;
            raw[cs.country] = temp;
          } else {
          raw[cs.country] = cs;
          }
        });

        // tslint:disable-next-line:no-angle-bracket-type-assertion
        return <GlobalDataSummary[]> Object.values(raw);
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          this.date = this.date - 1;
          this.globalDataURL = `${this.baseUrl}${this.getDate(this.month)}-${this.date}-${this.year}${this.extension}`;
          return this.getGlobalData();
        }
      })
    );
  }
}
