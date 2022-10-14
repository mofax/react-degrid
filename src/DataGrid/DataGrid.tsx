import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import "./datagrid.sass";

export type GetCellContentHandler = (
  column: IGridColumn,
  row: number
) => JSX.Element | null;

export default function DataGrid(propsArgs: IDataGridProps) {
  const defaultProps = {
    canSelectOneRow: true,
  };

  const props: IDataGridProps = Object.assign(defaultProps, propsArgs);

  const wrapperRef = useRef<HTMLDivElement>();

  const [allSelected, setAllSelected] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Record<number, boolean>>({});
  const [wrapperWidth, setWrapperWidth] = useState(0);

  useEffect(() => {
    if (props.selectedRows) {
      const newSelectedRows: TPOJO<boolean> = {};
      props.selectedRows.forEach((row) => {
        newSelectedRows[row] = true;
      });
      setSelectedRows(newSelectedRows);
    }
  }, [props.selectedRows]);

  const triggerSelectedChange = useCallback((rows: typeof selectedRows) => {
    if (props.onSelectedChange) {
      // convert to array
      const objToReturn: number[] = [];
      for (const row in rows) {
        if (rows[row]) {
          objToReturn.push(parseInt(row));
        }
      }
      props.onSelectedChange({ rows: objToReturn });
    }
  }, []);

  const handleHeaderCheckbox = (_event: ChangeEvent<HTMLInputElement>) => {
    const toggle = !allSelected;
    setAllSelected(toggle);
    const newSelectedRows: Record<number, boolean> = {};
    for (let i = 0; i < props.numberOfRows; i++) {
      newSelectedRows[i] = toggle;
    }
    setSelectedRows(newSelectedRows);
    ``;
    triggerSelectedChange(newSelectedRows);
  };

  const handleRowSelect = (rowNumber: number) => {
    let newSelectedRows = { ...selectedRows };
    const currentState = allSelected || Boolean(selectedRows[rowNumber]);
    const toggle = !currentState;
    if (toggle) {
      if (props.canSelectOneRow) {
        newSelectedRows = {};
        newSelectedRows[rowNumber] = true;
      } else {
        newSelectedRows[rowNumber] = toggle;
      }
    } else {
      delete newSelectedRows[rowNumber];
    }
    setSelectedRows(newSelectedRows);
    if (!toggle) {
      setAllSelected(false);
    }
    triggerSelectedChange(newSelectedRows);
  };

  const handleRect = useCallback((node: HTMLDivElement) => {
    if (node) {
      wrapperRef.current = node;
      setWrapperWidth(node.getBoundingClientRect().width);
    }
  }, []);

  /**
   * Computes css grid templates for the header and body.
   * It generates this based on the number of columns
   */
  function getTemplateColumns(): string {
    const template: string[] = [];
    const width = Math.floor(wrapperWidth / props.columns.length) - 40;

    // If we are displaying in list mode, we can just short circuit and return early
    if (props.isList === true) {
      if (!props.rowMarkers) return "1fr";
      return "40px 1fr";
    }

    if (props.fixWidthColumns === true) {
      for (let i = 0; i < props.columns.length; i++) {
        template.push(`${width}px`);
      }
    } else {
      for (let i = 0; i < props.columns.length; i++) {
        template.push(`1fr`);
      }
    }

    if (props.rowMarkers === "checkbox") {
      template.unshift("40px");
    }
    return template.join(" ");
  }

  /**
   * Renders the whole header row
   * If columns are 0, it will render null;
   * @returns
   */
  function renderHeader() {
    if (props.columns.length === 0) {
      return null;
    }

    const nodes = props.columns.map((column) => {
      return (
        <div className="grid-cell" key={column.id}>
          {column.title}
        </div>
      );
    });

    if (props.rowMarkers === "checkbox") {
      nodes.unshift(
        <div className="grid-cell" key="checkbox">
          <input
            type="checkbox"
            onChange={handleHeaderCheckbox}
            checked={allSelected}
            disabled={Boolean(props.disableRowMarkers)}
          />
        </div>
      );
    }

    return nodes;
  }

  function renderCells(rowNumber: number) {
    const checkBoxClick = () => {
      handleRowSelect(rowNumber);
    };

    if (!props.getCellContent) {
      return null;
    }

    const nodes = props.columns.map((column) => {
      return (
        <div className="grid-cell" key={`${rowNumber}_${column.id}`}>
          {props.getCellContent(column, rowNumber)}
        </div>
      );
    });

    if (props.rowMarkers === "checkbox") {
      const checked = Boolean(selectedRows[rowNumber]);

      nodes.unshift(
        <div className={"grid-cell"} key={`${rowNumber}_checkbox`}>
          <input
            type="checkbox"
            checked={checked}
            onChange={checkBoxClick}
            disabled={Boolean(props.disableRowMarkers)}
          />
        </div>
      );
    }

    return nodes;
  }

  function renderRowsAsTable() {
    const nodes = [];
    for (let i = 0; i < props.numberOfRows; i++) {
      const rowClass = ["grid-row"];
      if (Boolean(selectedRows[i])) rowClass.push("checked");
      nodes.push(
        <div
          className={rowClass.join(" ")}
          key={`table_row_${i}`}
          style={{
            gridTemplateColumns: getTemplateColumns(),
            gridTemplateRows: Number.isNaN(props.rowHeight)
              ? 32
              : props.rowHeight,
          }}
        >
          {renderCells(i)}
        </div>
      );
    }

    return nodes;
  }

  function renderRowsAsList() {
    if (!props.getRowContent) {
      return null;
    }

    function renderCheckbox(rowNumber: number) {
      if (props.rowMarkers === "checkbox") {
        const checked = Boolean(selectedRows[rowNumber]);

        return (
          <div className={"grid-cell"} key={`${rowNumber}_checkbox`}>
            <input
              type="checkbox"
              checked={checked}
              onChange={handleRowSelect.bind(null, rowNumber)}
              disabled={Boolean(props.disableRowMarkers)}
            />
          </div>
        );
      }
      return null;
    }

    const nodes = [];
    for (let i = 0; i < props.numberOfRows; i++) {
      const rowNumber = i;
      const rowClass = ["grid-row"];
      if (Boolean(selectedRows[rowNumber])) rowClass.push("checked");
      const rowNodes = [];
      rowNodes.push(
        <div
          className={rowClass.join(" ")}
          key={`list_row_${i}`}
          style={{
            gridTemplateColumns: getTemplateColumns(),
            gridTemplateRows: Number.isNaN(props.rowHeight)
              ? 32
              : props.rowHeight,
          }}
        >
          {renderCheckbox(rowNumber)}
          {props.getRowContent(rowNumber)}
        </div>
      );

      nodes.push(rowNodes);
    }

    return nodes;
  }

  function renderRows() {
    if (props.isList === true) {
      return renderRowsAsList();
    } else {
      return renderRowsAsTable();
    }
  }

  return (
    <div ref={handleRect} className="react-degrid grid-wrapper">
      <div
        className="grid-header"
        style={{
          gridTemplateColumns: getTemplateColumns(),
        }}
      >
        {renderHeader()}
      </div>
      <div
        className="grid-body"
        style={{
          gap: props.rowMargin,
        }}
      >
        {renderRows()}
      </div>
      <div className="grid-footer"></div>
    </div>
  );
}
