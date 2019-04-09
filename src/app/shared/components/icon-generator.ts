import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

export class IconGenerator {

	constructor(
		public iconRegistry: MatIconRegistry,
		public sanitizer: DomSanitizer
	) {
	}

	getIcon(name) {
		this.iconRegistry.addSvgIcon(
			name,
			this.sanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${name}.svg`)
		);
	}

}
