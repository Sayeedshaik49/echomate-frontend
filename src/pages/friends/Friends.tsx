import { useAppDispatch, useAppSelector } from "src/redux/hooks";
import { setSnack } from "src/redux/reducers/snack.reducer";
import { convertStyleToReact } from "utils/helper.function";

export default function Friends() {
  const dispatch = useAppDispatch();
  const { user, socket } = useAppSelector((state) => ({
    user: state.auth.user,
    socket: state.socket.socket,
  }));
  return (
    <div className="container">
      <div className="card overflow-hidden">
        <div className="card-body p-0">
          <div className="row align-items-center">
            <div className="col-lg-4 order-lg-1 order-2"></div>
            <div className="col-lg-4 mt-n3 order-lg-2 order-1 py-5" style={{}}>
              <div className="mt-n5">
                <div className="d-flex align-items-center justify-content-center mb-2">
                  <div
                    className="linear-gradient d-flex align-items-center justify-content-center"
                    style={convertStyleToReact("width: 110px; height: 110px;")}
                  >
                    <div
                      className="border border-4 border-white d-flex align-items-center justify-content-center overflow-hidden"
                      style={convertStyleToReact(
                        "width: 100px; height: 100px;"
                      )}
                    >
                      <img
                        src={
                          user?.photoURL ||
                          "https://bootdey.com/img/Content/avatar/avatar1.png"
                        }
                        alt=""
                        className="w-100 h-100"
                      />
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <h5 className="fs-5 mb-0 fw-semibold">{user?.displayName}</h5>
                  <p className="mb-0 fs-4">{user?.email}</p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 order-last"></div>
          </div>
        </div>
      </div>
      <div className="tab-content" id="pills-tabContent">
        <div
          className="tab-pane fade show active"
          id="pills-friends"
          role="tabpanel"
          aria-labelledby="pills-friends-tab"
          tabIndex={0}
        >
          <div className="d-sm-flex align-items-center justify-content-between mt-3 mb-4">
            <h3 className="mb-3 mb-sm-0 fw-semibold d-flex align-items-center">
              Friends{" "}
              <span className="badge text-bg-secondary fs-2 rounded-4 py-1 px-2 ms-2">
                {(user?.requests.length || 0) + (user?.friends?.length || 0)}
              </span>
            </h3>
          </div>
          <div className="row">
            {user?.requests.map((request) => (
              <div key={request._id} className="col-sm-6 col-lg-4">
                <div className="card hover-img">
                  <div className="card-body p-4 text-center border-bottom">
                    <img
                      src={
                        request.photoURL ||
                        "https://bootdey.com/img/Content/avatar/avatar1.png"
                      }
                      alt=""
                      className="mb-3"
                      width="80"
                      height="80"
                    />
                    <h5 className="fw-semibold mb-0">{request.displayName}</h5>
                    <span className="text-dark fs-5">{request.email}</span>

                    <div className="mt-3">
                      <button
                        onClick={() => {
                          const obj = {
                            receiver: user?._id,
                            sender: request._id,
                          };
                          socket?.emit("accept-friend-request", obj);
                          dispatch(
                            setSnack({
                              open: true,
                              message: "Friend request accepted",
                              type: "success",
                            })
                          );
                        }}
                        className="form-control"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => {
                          const obj = {
                            receiver: user?._id,
                            sender: request._id,
                          };
                          socket?.emit("reject-friend-request", obj);
                          dispatch(
                            setSnack({
                              open: true,
                              message: "Friend request rejected",
                              type: "error",
                            })
                          );
                        }}
                        className="form-control mt-3"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {user?.friends.map((request) => (
              <div key={request._id} className="col-sm-6 col-lg-4">
                <div className="card hover-img">
                  <div className="card-body p-4 text-center border-bottom">
                    <img
                      src={
                        request.photoURL ||
                        "https://bootdey.com/img/Content/avatar/avatar1.png"
                      }
                      alt=""
                      className="mb-3"
                      width="80"
                      height="80"
                    />
                    <h5 className="fw-semibold mb-0">{request.displayName}</h5>
                    <span className="text-dark fs-5">{request.email}</span>
                    <button
                      onClick={() => {
                        socket?.emit("unfriend-user", {
                          receiver: user?._id,
                          sender: request._id,
                        });
                      }}
                      className="mt-3 form-control"
                    >
                      unfriend
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
