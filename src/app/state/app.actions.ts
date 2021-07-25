import {DatasetId} from '../models/dataset-id.enum';

export namespace AppActions {

	/**
	 * Action to define the data set to show.
	 */
	export class SelectDataset {
		static readonly type = '[App] select dataset';

		constructor(public datasetId: DatasetId) {
		}
	}

	/**
	 * Action to define the graph date range to show.
	 */
	export class SelectDateRange {
		static readonly type = '[App] select date range';

		constructor(public dateRange: [Date, Date]) {
		}
	}

	/**
	 * Action to set the max s rank of products to display.
	 */
	export class SelectMaxRank {
		static readonly type = '[App] select max rank';

		constructor(public maxRank: number) {
		}
	}
}
