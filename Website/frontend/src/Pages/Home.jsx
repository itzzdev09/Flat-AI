
import Poster from '../Components/Home/Poster';
import FindFlat from '../Components/Home/FindFlat';
import AllFlats from '../Components/Home/AllFlats';
import SearchResult from '../Components/Home/SearchResult'
import { MotionSection } from '../Components/Sections/Motion'



const Home = () => {

  return (
    <>
      <Poster />
      <MotionSection><FindFlat /></MotionSection>
      <MotionSection><SearchResult/></MotionSection>
      <MotionSection><AllFlats /></MotionSection>
    </>
  );
};

export default Home;
