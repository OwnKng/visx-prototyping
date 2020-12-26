import "./App.css";
import { economicsData } from "./gdpPerCapLifeExp";
import { group } from "d3";
import ParentSize from "@visx/responsive/lib/components/ParentSize";
import LineChart from "./LineChart";
import styled from "styled-components";

const StyledGrid = styled.div`
  display: grid;
  height: 600px;
  width: 100%;
  row-gap: 10px;
  grid-template-columns: repeat(5, minmax(100px, 1fr));
  grid-template-rows: repeat(2, minmax(100px, 1fr));

  @media only screen and (max-width: 600px) {
    grid-template-columns: repeat(2, minmax(100px, 1fr));
    grid-template-rows: repeat(5, minmax(100px, 1fr));
    height: 800px;
  }
`;

const App = () => {
  let data = economicsData;

  const order = data
    .filter((row) => row.year === 2019)
    .sort((a, b) => a.gdpPerCap - b.gdpPerCap)
    .map((row) => row.country);

  data = data.sort(
    (a, b) => order.indexOf(b.country) - order.indexOf(a.country)
  );

  const dataGrouped = Array.from(
    group(data, (d) => d.country),
    ([key, value]) => ({ key, value })
  );

  return (
    <div style={{ width: "100%" }}>
      <StyledGrid>
        {dataGrouped.map((data, i) => (
          <ParentSize>
            {({ width, height }) => (
              <LineChart
                index={i}
                dataKey={data.key}
                data={data.value}
                width={width}
                height={height}
                x='year'
                y='gdpPerCap'
              />
            )}
          </ParentSize>
        ))}
      </StyledGrid>
    </div>
  );
};

export default App;

/* 
const [data, setData] = useState(null);
  const url =
    "https://api.worldbank.org/v2/country/KOR/indicator/NY.GDP.PCAP.CD?date=1960:2019&format=json&per_page=120";

  const getData = async () => {
    try {
      let res = await fetch(url).then((response) => response.json());
      setData(res[1]);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getData();
  }, []);

*/
