import Button from "../_commons/button";
interface exhibitFooterProps {
  currentExhibit: any;
  getUserInfoForAuth: any;
  selectedPolicies: any;
  act: any;
  children?: any;
}
export default function ExhibitFooter({
  currentExhibit,
  getUserInfoForAuth,
  selectedPolicies,
  act,
}: exhibitFooterProps) {
  return (
    <div className="h-74 w-100x flex-row justify-center align-center">
      {!getUserInfoForAuth() ? (
        <span className="mr-20 fs-14 icon-999 fw-regular">
          进行签约及授权管理，请先登录
        </span>
      ) : null}
      <Button
        disabled={
          (selectedPolicies.length === 0 && getUserInfoForAuth()) ||
          !currentExhibit.isAvailable ||
          currentExhibit.onlineStatus === 0
        }
        click={act}
        className={
          (getUserInfoForAuth() ? "w-300" : "") +
          " px-20 h-38 fs-14 flex-column-center"
        }
      >
        {getUserInfoForAuth() ? "立即签约" : "立即登录"}
      </Button>
    </div>
  );
}
