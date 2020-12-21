// import LineChart from "./LineChart";
import ParentSize from "@visx/responsive/lib/components/ParentSize";
import ScatterPlot from "./ScatterPlot";
import MultiLineChart from "./MultiLineChart";
import "./App.css";

const App = () => {
  return (
    <>
      <h1>Hello</h1>
      <div style={{ height: "100vh", width: "100vw" }}>
        <>
          <ParentSize>
            {({ width, height }) => (
              <ScatterPlot width={width} height={height} />
            )}
          </ParentSize>
        </>
      </div>
    </>
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
