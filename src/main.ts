// import { Buffer } from 'buffer';
// (window as any).global = window;
// (window as any).process = {
//   env: {},
//   version: '',
//   nextTick: (fn: Function) => setTimeout(fn, 0),
//   browser: true,
// };
// (window as any).Buffer = Buffer;

/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
