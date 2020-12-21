// import LineChart from "./LineChart";
import ParentSize from "@visx/responsive/lib/components/ParentSize";
// import ScatterPlot from "./ScatterPlot";
// import { fundamentals } from "./EconFundamentals";
import MultiLineChart from "./MultiLineChart";

const App = () => {
  return (
    <div style={{ height: "90vh", width: "100vw" }}>
      <>
        <ParentSize>
          {({ width, height }) => (
            <MultiLineChart width={width} height={height} />
          )}
        </ParentSize>
      </>
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
