type POJO = Record<string, unknown>
type TPOJO<T> = Record<string, T>
type Nullable<T> = T | null

interface IGridColumn {
    id: string;
    title: string;
}

interface IDataGridPropsBase {
    rowMarkers: "checkbox" | "none";
    disableRowMarkers?: boolean;
    rowHeight?: number;
    rowMargin?: number;
    numberOfRows: number;
    fixWidthColumns?: boolean;
    columnMargin?: number;
    columns: IGridColumn[];
    isList?: boolean;
    isTable?: boolean;
    canSelectOneRow?: boolean;
    selectedRows?: number[];
    onSelectedChange?: (val: { rows: number[] }) => void;
    getCellContent?: (column: IGridColumn, row: number) => JSX.Element | null;
    getRowContent?: (row: number) => JSX.Element | null;
}

interface IDataGridAsTable {
    isTable: true;
    isList?: false;
    getCellContent: (column: IGridColumn, row: number) => JSX.Element | null;
    getRowContent?: null;
}

interface IDataGridAsList {
    isList: true;
    isTable?: false;
    getRowContent: (row: number) => JSX.Element | null;
    getCellContent?: null;
}

type IDataGridView = IDataGridAsTable | IDataGridAsList;

type IDataGridProps = IDataGridPropsBase & IDataGridView;