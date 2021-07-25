import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	OnChanges,
	OnInit,
	Output,
	SimpleChanges
} from '@angular/core';
import {DatasetId} from '../../../../models/dataset-id.enum';

import * as moment from 'moment';

declare let $: any;

@Component({
	selector: 'dh-rank-viewer-filters',
	templateUrl: './rank-viewer-filters.component.html',
	styleUrls: ['./rank-viewer-filters.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RankViewerFiltersComponent implements OnInit, OnChanges {

	@Input() selectedId: DatasetId | null = null;
	@Input() datasetIds: DatasetId[] | null = [];
	@Input() selectedMinMaxDateRange: [Date, Date] | null = null;
	@Input() selectedDateRange: [Date, Date] | null = null;
	@Input() selectedMaxRank: number | null = null;

	@Output() datasetSelect: EventEmitter<DatasetId> = new EventEmitter<DatasetId>();
	@Output() dateRangeSelect: EventEmitter<[Date, Date]> = new EventEmitter<[Date, Date]>();
	@Output() maxRankSelect: EventEmitter<number> = new EventEmitter<number>();

	formattedSelectedDateRange: string = '';

	private datePikerAlreadyInit: boolean = false;

	constructor() {
	}

	ngOnInit(): void {
		this.initDateRangePicker();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.selectedDateRange?.currentValue) {
			this.updateFormattedSelectedDateRange();
		}
		this.updateDateRangePicker();
	}

	/**
	 * Initialise the date picker if not already done.
	 */
	private initDateRangePicker() {
		if (!this.datePikerAlreadyInit) {
			const startDate = this.selectedDateRange ? moment(this.selectedDateRange[0]) : moment().subtract(6, 'days');
			const endDate = this.selectedDateRange ? moment(this.selectedDateRange[1]) : moment();

			const minDate = this.selectedMinMaxDateRange ? moment(this.selectedMinMaxDateRange[0]) : moment().subtract(6, 'days');
			const maxDate = this.selectedMinMaxDateRange ? moment(this.selectedMinMaxDateRange[1]) : moment();

			$('#dateRangeSelector').daterangepicker({
				opens: 'left',
				alwaysShowCalendars: true,
				startDate,
				endDate,
				minDate,
				maxDate,
				ranges: { // in case we have more recent data
					'Today': [moment(), moment()],
					'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
					'Last 7 Days': [moment().subtract(6, 'days'), moment()],
					'Last 30 Days': [moment().subtract(29, 'days'), moment()],
					'This Month': [moment().startOf('month'), moment().endOf('month')],
					'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
				}
			}, (start: moment.Moment, end: moment.Moment, label: string) => {
				this.onChangeDateRange(start, end, label);
			});

			this.datePikerAlreadyInit = true;
		}
	}

	/**
	 * Action taken when change the category
	 * @param datasetId
	 */
	onDatasetClick(datasetId: string) {
		this.datasetSelect.emit(datasetId as DatasetId);
	}

	/**
	 * Action taken when selecting a date range.
	 * @param start range start date
	 * @param end range end date
	 * @param label ????
	 */
	private onChangeDateRange(start: moment.Moment, end: moment.Moment, label: string) {
		this.dateRangeSelect.emit([start.toDate(), end.toDate()]);
	}

	/**
	 * Action taken when change max rank.
	 * @param maxRank the new max rank selected.
	 */
	onChangeMaxRank(maxRank: number) {
		this.maxRankSelect.emit(maxRank);
	}

	/**
	 * Update date range formatting for display.
	 */
	private updateFormattedSelectedDateRange() {
		if (this.selectedDateRange) {
			const startDate = moment(this.selectedDateRange[0]);
			const endDate = moment(this.selectedDateRange[1]);
			this.formattedSelectedDateRange = `${startDate.format('MM/DD/YYYY')} to ${endDate.format('MM/DD/YYYY')}`;
		} else {
			this.formattedSelectedDateRange = '';
		}
	}

	/**
	 * Updates the minimum and maximum selectable date of the date picker.
	 */
	private updateDateRangePicker() {
		if (this.datePikerAlreadyInit && this.selectedMinMaxDateRange) {
			const dateRangePicker: any = $('#dateRangeSelector').data('daterangepicker');
			dateRangePicker.minDate = moment(this.selectedMinMaxDateRange[0]);
			dateRangePicker.maxDate = moment(this.selectedMinMaxDateRange[1]);
			dateRangePicker.updateView()
		}
	}

}
