import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import GrowthPlanEdit from "../../components/Shop/Premiumweb/GrowthPlan/GrowthPlanEdit";

const GrowthPlanEditWrapper = () => {
  const { id } = useParams();
  const { seller } = useSelector((state) => state.seller);
  const isOwner = seller && seller._id === id;
  return <GrowthPlanEdit isOwner={isOwner} />;
};

export default GrowthPlanEditWrapper;