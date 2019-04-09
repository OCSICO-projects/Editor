import { Injectable } from '@angular/core';

import fabric from 'app/editor/fabric';
import { CanvasTemplates } from '../models/canvas-templates.model';

@Injectable({
	providedIn: 'root'
})
export class PainterFactory {
	make(fabricCanvas: any): PainterService {
		return new PainterService(fabricCanvas);
	}
}

export class PainterService {
	readonly templateGroupId = '#_template';
	readonly gridGroupId = '#_grid';
	readonly gridLineSettings = {
		stroke: '#787878',
		opacity: 0.13,
		strokeWidth: 1,
		evented: false,
		selectable: false
	};
	readonly settings = {
		strokeColor: '#b2bbca',
		strokeWidth: 10,
	};

	constructor(private canvas: any) {
		this.initGroup(this.templateGroupId);
		this.initGroup(this.gridGroupId);
	}

	private initGroup(id: string) {
		if (!this.findGroup(id)) {
			const group = new fabric.Group([], {
				id,
				evented: false,
				selectable: false,
			});

			this.canvas.add(group);
		}
	}

	private findGroup(id: string) {
		const objects = this.canvas.getObjects();

		const group = objects.find(object => object.id === id);

		return group || null;
	}

	drawGrid(gridSize) {
		this.initGroup(this.gridGroupId);
		const gridGroup = this.findGroup(this.gridGroupId);

		gridGroup.getObjects().slice().forEach(object => gridGroup.remove(object));
		gridGroup.addWithUpdate();
		gridGroup.bringToFront();

		const canvasWidth = this.canvas.getWidth();
		const canvasHeight = this.canvas.getHeight();
		const linesCount = canvasWidth / gridSize;
		for (let i = 0; i < linesCount; i++) {
			const horizontalLine = new fabric.Line([i * gridSize, 0, i * gridSize, canvasHeight], this.gridLineSettings);
			const verticalLine = new fabric.Line([0, i * gridSize, canvasWidth, i * gridSize], this.gridLineSettings);
			gridGroup.add(horizontalLine, verticalLine);
		}
		gridGroup.addWithUpdate();

		return this;
	}

	setGridIsShown(isShown: boolean): this {
		this.findGroup(this.gridGroupId).set('visible', isShown);

		return this;
	}

	changeTemplate(template: CanvasTemplates): this {
		this.initGroup(this.templateGroupId);
		const templateGroup = this.findGroup(this.templateGroupId);

		templateGroup.getObjects().slice().forEach(object => templateGroup.remove(object));
		templateGroup.bringToFront();

		switch (template) {
			case CanvasTemplates.cell: this.drawTemplateCell(); break;
			case CanvasTemplates.fourCells: this.drawTemplateFourCells(); break;
			case CanvasTemplates.columnThreeRows: this.drawTemplateColumnThreeRows(); break;
			case CanvasTemplates.columnTwoRows: this.drawTemplateColumnTwoRows(); break;
			case CanvasTemplates.rowThreeColumns: this.drawTemplateRowThreeColumns(); break;
			case CanvasTemplates.rowTwoColumns: this.drawTemplateRowTwoColumns(); break;
			case CanvasTemplates.theater: this.drawTemplateTheater(); break;
			case CanvasTemplates.threeColumns: this.drawTemplateThreeColumns(); break;
			case CanvasTemplates.threeRows: this.drawTemplateThreeRows(); break;
			case CanvasTemplates.twoColumns: this.drawTemplateTwoColumns(); break;
			case CanvasTemplates.twoColumnsRow: this.drawTemplateTwoColumnsRow(); break;
			case CanvasTemplates.twoRows: this.drawTemplateTwoRows(); break;
		}

		return this;
	}

	setTemplateIsShown(isShown: boolean): this {
		this.findGroup(this.templateGroupId).set('visible', isShown);

		return this;
	}

	private makeVerticalLine(x1Percent, y1Percent, x2Percent, y2Percent) {
		const halfStrokeWidth = this.settings.strokeWidth / 2;
		const canvasWidth = this.canvas.getWidth();
		const canvasHeight = this.canvas.getHeight();

		const x1 = canvasWidth * x1Percent - halfStrokeWidth;
		const y1 = canvasHeight * y1Percent;
		const x2 = canvasWidth * x2Percent - halfStrokeWidth;
		const y2 = canvasHeight * y2Percent;

		return this.makeLine(x1, y1, x2, y2);
	}

	private makeHorizontalLine(x1Percent, y1Percent, x2Percent, y2Percent) {
		const halfStrokeWidth = this.settings.strokeWidth / 2;
		const canvasWidth = this.canvas.getWidth();
		const canvasHeight = this.canvas.getHeight();

		const x1 = canvasWidth * x1Percent;
		const y1 = canvasHeight * y1Percent - halfStrokeWidth;
		const x2 = canvasWidth * x2Percent;
		const y2 = canvasHeight * y2Percent - halfStrokeWidth;

		return this.makeLine(x1, y1, x2, y2);
	}

	private makeLine(x1, y1, x2, y2) {
		const settings = this.settings;

		return new fabric.Line([x1, y1, x2, y2], {
			stroke: settings.strokeColor,
			strokeWidth: settings.strokeWidth,
		});
	}

	private drawTemplateCell(): void {
	}

	private drawTemplateFourCells(): void {
		const line1 = this.makeVerticalLine(0.5, 0, 0.5, 1);
		const line2 = this.makeHorizontalLine(0, 0.5, 1, 0.5);
		this.findGroup(this.templateGroupId).addWithUpdate(line1).addWithUpdate(line2);
	}

	private drawTemplateColumnThreeRows(): void {
		const columnLine = this.makeVerticalLine(0.5, 0, 0.5, 1);
		const rowsLine1 = this.makeHorizontalLine(0.5, 0.333, 1, 0.333);
		const rowsLine2 = this.makeHorizontalLine(0.5, 0.666, 1, 0.666);
		this.findGroup(this.templateGroupId).addWithUpdate(columnLine).addWithUpdate(rowsLine1).addWithUpdate(rowsLine2);
	}

	private drawTemplateColumnTwoRows(): void {
		const columnLine = this.makeVerticalLine(0.5, 0, 0.5, 1);
		const rowsLine = this.makeHorizontalLine(0.5, 0.5, 1, 0.5);
		this.findGroup(this.templateGroupId).addWithUpdate(columnLine).addWithUpdate(rowsLine);
	}

	private drawTemplateRowThreeColumns(): void {
		const rowLine = this.makeHorizontalLine(0, 0.5, 1, 0.5);
		const columnsLine1 = this.makeVerticalLine(0.333, 0.5, 0.333, 1);
		const columnsLine2 = this.makeVerticalLine(0.666, 0.5, 0.666, 1);
		this.findGroup(this.templateGroupId).addWithUpdate(rowLine).addWithUpdate(columnsLine1).addWithUpdate(columnsLine2);
	}

	private drawTemplateRowTwoColumns(): void {
		const rowLine = this.makeHorizontalLine(0, 0.5, 1, 0.5);
		const columnsLine = this.makeVerticalLine(0.5, 0.5, 0.5, 1);
		this.findGroup(this.templateGroupId).addWithUpdate(rowLine).addWithUpdate(columnsLine);
	}

	private drawTemplateTheater(): void {
		const rowLine = this.makeHorizontalLine(0, 0.8, 1, 0.8);
		const columnLine1 = this.makeVerticalLine(0.1, 0, 0.1, 0.8);
		const columnLine2 = this.makeVerticalLine(0.9, 0, 0.9, 0.8);
		this.findGroup(this.templateGroupId).addWithUpdate(rowLine).addWithUpdate(columnLine1).addWithUpdate(columnLine2);
	}

	private drawTemplateThreeColumns(): void {
		const line1 = this.makeVerticalLine(0.333, 0, 0.333, 1);
		const line2 = this.makeVerticalLine(0.666, 0, 0.666, 1);
		this.findGroup(this.templateGroupId).addWithUpdate(line1).addWithUpdate(line2);
	}

	private drawTemplateThreeRows(): void {
		const line1 = this.makeHorizontalLine(0, 0.33, 1, 0.33);
		const line2 = this.makeHorizontalLine(0, 0.66, 1, 0.66);
		this.findGroup(this.templateGroupId).addWithUpdate(line1).addWithUpdate(line2);
	}

	private drawTemplateTwoColumns(): void {
		const line = this.makeVerticalLine(0.5, 0, 0.5, 1);
		this.findGroup(this.templateGroupId).addWithUpdate(line);
	}

	private drawTemplateTwoColumnsRow(): void {
		const rowLine = this.makeHorizontalLine(0, 0.5, 1, 0.5);
		const columnsLine = this.makeVerticalLine(0.5, 0, 0.5, 0.5);
		this.findGroup(this.templateGroupId).addWithUpdate(rowLine).addWithUpdate(columnsLine);
	}

	private drawTemplateTwoRows(): void {
		const line = this.makeHorizontalLine(0, 0.5, 1, 0.5);
		this.findGroup(this.templateGroupId).addWithUpdate(line);
	}
}
