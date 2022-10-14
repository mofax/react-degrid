import DataGrid, { GetCellContentHandler } from "./DataGrid/DataGrid";
import { faker } from "@faker-js/faker";

function ExampleGrid() {
  const columns = [
    {
      id: "firstName",
      title: "First Name",
    },
    {
      id: "lastName",
      title: "Last Name",
    },
    {
      id: "age",
      title: "Age",
    },
  ];

  const rows = Array.from({ length: 1000 }, () => ({
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    age: faker.random.numeric(2),
  }));

  const getCellContent: GetCellContentHandler = (column, rowNumber) => {
    const data = rows[rowNumber];
    switch (column.id) {
      case "firstName":
        return <span>{data?.firstName}</span>;
      case "lastName":
        return <span>{data?.lastName}</span>;
      case "age":
        return <span>{data?.age}</span>;
      default:
        return null;
    }
  };

  return (
    <>
      <DataGrid
        isTable={true}
        rowMarkers={"checkbox"}
        numberOfRows={rows.length}
        columns={columns}
        getCellContent={getCellContent}
      />
    </>
  );
}

export default function App() {
  return (
    <div>
      <h1>A simple grid for not so simple applications</h1>
      <div>
        <h2>Examples</h2>
        <h3>1000 rows</h3>
        <div className="grid-example">
          <ExampleGrid />
        </div>
      </div>
    </div>
  );
}
