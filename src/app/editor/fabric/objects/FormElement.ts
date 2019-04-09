import HtmlElement from './HtmlElement';

export default abstract class FormElement extends HtmlElement {
    isNotVisible() {
        // @ts-ignore
        const container = this.group || this.formGroup;
        const notVisible = container && !container.visible;

        return notVisible || super.isNotVisible();
    }
}
