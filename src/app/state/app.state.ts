import {Injectable} from '@angular/core';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {AppActions} from './app.actions';
import {DatasetId} from '../models/dataset-id.enum';
import {ProductRank} from '../models/product-rank.type';
import {BedroomFurnitureBSROverTime} from '../../assets/dataset/BSR/bedroom-furniture.dataset';
import {MattressesAndBoxSpringsBSROverTime} from '../../assets/dataset/BSR/mattresses-and-box-springs.dataset';
import {FurnitureBSROverTime} from '../../assets/dataset/BSR/furniture.dataset';
import * as moment from 'moment';

function getDataRange(dataset: ProductRank[], dateRange: [Date, Date], maxRank: number): ProductRank[] {
	return dataset.filter((p) => moment(p.date, 'MM/DD/YYYY').isBetween(dateRange[0], dateRange[1]) && p.rank <= maxRank);
}

/**
 * Get the min and max date range for a data set.
 * @param dataset
 */
function getDataSetDateRange(dataset: ProductRank[]): [Date, Date] {
	const sortDataSet: ProductRank[] = [...dataset].sort((p1: ProductRank, p2: ProductRank) => {
		return p1.date.localeCompare(p2.date);
	})
	const dateRangeStart: Date = moment(sortDataSet[0].date, 'MM/DD/YYYY').toDate();
	const dateRangeEnd: Date = moment(sortDataSet[sortDataSet.length - 1].date, 'MM/DD/YYYY').toDate();
	return [dateRangeStart, dateRangeEnd];
}

export interface AppStateModel {
	dataset: { [key in DatasetId]: ProductRank[] };
	selectedDatasetId: DatasetId;
	selectedDateRange: [Date, Date];
	minMaxDateRange: [Date, Date];
	maxRank: number;
}

/**
 * Default date range for the init state.
 */
const defaultDateRange: [Date, Date] = [moment('11/30/2019', 'MM/DD/YYYY').utc(true).subtract(6, 'days').toDate(), moment('11/30/2019', 'MM/DD/YYYY').utc(true).toDate()]

/**
 * Default max rank for the init state.
 */
const defaultMaxRank: number = 100;

const defaults: AppStateModel = {
	dataset: {
		[DatasetId.BSR_FURNITURE]: getDataRange(FurnitureBSROverTime, defaultDateRange, defaultMaxRank),
		[DatasetId.BSR_BEDROOM_FURNITURE]: getDataRange(BedroomFurnitureBSROverTime, defaultDateRange, defaultMaxRank),
		[DatasetId.BSR_MATTRESSES_AND_BOX_SPRINGS]: getDataRange(MattressesAndBoxSpringsBSROverTime, defaultDateRange, defaultMaxRank),
	},
	selectedDatasetId: DatasetId.BSR_FURNITURE,
	selectedDateRange: defaultDateRange,
	minMaxDateRange: getDataSetDateRange(FurnitureBSROverTime),
	maxRank: defaultMaxRank,
}

@State<AppStateModel>({
	name: 'app',
	defaults
})
@Injectable()
export class AppState {
	constructor() {
	}

	@Selector()
	public static selectedDataset(state: AppStateModel): ProductRank[] {
		return state.dataset[state.selectedDatasetId];
	}

	@Selector()
	public static selectedDatasetId(state: AppStateModel): DatasetId {
		return state.selectedDatasetId;
	}

	@Selector()
	public static selectedDateRange(state: AppStateModel): [Date, Date] {
		return state.selectedDateRange;
	}

	@Selector()
	public static selectedMinMaxDateRange(state: AppStateModel): [Date, Date] {
		return state.minMaxDateRange;
	}

	@Selector()
	public static selectedMaxRank(state: AppStateModel): number {
		return state.maxRank;
	}

	/**
	 * Update selected data set
	 * @param patchState state update function
	 * @param datasetId new category identifier selected
	 */
	@Action(AppActions.SelectDataset)
	selectDataset({patchState}: StateContext<AppStateModel>, {datasetId}: AppActions.SelectDataset) {
		let minMaxDateRange: [Date, Date];
		switch (datasetId) {
			case DatasetId.BSR_BEDROOM_FURNITURE:
				minMaxDateRange = getDataSetDateRange(BedroomFurnitureBSROverTime);
				break;
			case DatasetId.BSR_FURNITURE:
				minMaxDateRange = getDataSetDateRange(FurnitureBSROverTime);
				break;
			case DatasetId.BSR_MATTRESSES_AND_BOX_SPRINGS:
				minMaxDateRange = getDataSetDateRange(MattressesAndBoxSpringsBSROverTime);
				break;
			default:
				minMaxDateRange = getDataSetDateRange(FurnitureBSROverTime);
		}

		patchState({selectedDatasetId: datasetId, minMaxDateRange});
	}

	/**
	 * Update selected date range
	 * @param patchState state update function
	 * @param dateRange new date range
	 * @param getState function to get the current State.
	 */
	@Action(AppActions.SelectDateRange)
	selectDateRange({patchState, getState}: StateContext<AppStateModel>, {dateRange}: AppActions.SelectDateRange) {
		const oldState: AppStateModel = getState();
		patchState({
			selectedDateRange: dateRange,
			dataset: {
				[DatasetId.BSR_FURNITURE]: getDataRange(FurnitureBSROverTime, dateRange, oldState.maxRank),
				[DatasetId.BSR_BEDROOM_FURNITURE]: getDataRange(BedroomFurnitureBSROverTime, dateRange, oldState.maxRank),
				[DatasetId.BSR_MATTRESSES_AND_BOX_SPRINGS]: getDataRange(MattressesAndBoxSpringsBSROverTime, dateRange, oldState.maxRank),
			},
		});
	}

	/**
	 * Update selected date range
	 * @param patchState state update function
	 * @param maxRank new max rank
	 * @param getState function to get the current State.
	 */
	@Action(AppActions.SelectMaxRank)
	selectMaxRank({patchState, getState}: StateContext<AppStateModel>, {maxRank}: AppActions.SelectMaxRank) {
		const oldState: AppStateModel = getState();
		patchState({
			maxRank,
			dataset: {
				[DatasetId.BSR_FURNITURE]: getDataRange(FurnitureBSROverTime, oldState.selectedDateRange, maxRank),
				[DatasetId.BSR_BEDROOM_FURNITURE]: getDataRange(BedroomFurnitureBSROverTime, oldState.selectedDateRange, maxRank),
				[DatasetId.BSR_MATTRESSES_AND_BOX_SPRINGS]: getDataRange(MattressesAndBoxSpringsBSROverTime, oldState.selectedDateRange, maxRank),
			},
		});
	}


}
