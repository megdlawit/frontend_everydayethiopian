// Place this above your App component or in a separate file if you prefer
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import ShopProfileDataEdit from "../../components/Shop/ShopProfileDataEdit";

const ShopProfileDataEditWrapper = () => {
  const { id } = useParams();
  const { seller } = useSelector((state) => state.seller);
  const isOwner = seller && seller._id === id;
  return <ShopProfileDataEdit isOwner={isOwner} />;
};

export default ShopProfileDataEditWrapper;