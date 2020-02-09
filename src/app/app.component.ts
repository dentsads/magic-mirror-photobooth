import { Component, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent {
  title = 'photobooth';
  document: Document;

  constructor(
    @Inject(DOCUMENT) document: Document
  ) {
    this.document = document;
    
    
    // disable dragging across all items
    window.ondragstart = function() { return false; } 

    if (environment.production)
      this.loadProductionCss();
  }

  loadProductionCss() {
    const headEl = this.document.getElementsByTagName('head')[0];
    const newLinkEl = this.document.createElement('link');
    newLinkEl.rel = 'stylesheet';
    newLinkEl.href = 'productionStyles.css';

    headEl.appendChild(newLinkEl)
  }
}
