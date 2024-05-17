import { useEffect } from "react";
import Page from "../../components/Page";
import { convertStyleToReact } from "../../utils/helper.function";
import "./home.css";
import { useAppSelector } from "src/redux/hooks";
import moment from "moment";
import CommentComponent from "./CommentComponent";
import { Icon } from "@iconify/react";
import { orderBy } from "lodash";
import CreatePostComponent from "components/CreatePostComponent";

export default function Home() {
  const { posts, user, socket } = useAppSelector((state) => ({
    posts: state.posts.posts,
    user: state.auth.user,
    socket: state.socket.socket,
  }));
  useEffect(() => {
    convertStyleToReact(
      "border-bottom-width: 1px;border-bottom-color: var(--bs-navbar-active-color);"
    );
  }, []);
  return (
    <Page title="Home">
      <div className="container">
        <div className="row">
          <div className="col-sm-8 col-sm-offset-2">
            <div className="row">
              <CreatePostComponent />
              {orderBy(posts, "timestamp", "desc").map((post) => (
                <div className="col-sm-12" key={post._id}>
                  <div className="panel panel-white post">
                    <div className="post-heading">
                      <div className="d-flex">
                        <img
                          src={
                            user?.photoURL ||
                            "https://bootdey.com/img/Content/avatar/avatar1.png"
                          }
                          className="img-circle avatar"
                          alt="user profile image"
                        />

                        <div className="pull-left meta">
                          <div className="title h5">
                            <a href="#">
                              <b>{post.owner.displayName}</b>
                            </a>
                          </div>
                          <h6 className="text-muted time">
                            {moment(post.timestamp).format("DD MMM")}
                          </h6>
                        </div>
                      </div>
                    </div>
                    <div className="post-image">
                      {post.type.includes("image") && (
                        <img
                          src={post.content}
                          className="image"
                          alt="image post"
                        />
                      )}
                      {post.type.includes("video") && (
                        <video src={post.content} className="image" />
                      )}
                      {post.type.includes("text") && (
                        <div className="p-5 border-top border-bottom">
                          <h2>{post.content}</h2>
                        </div>
                      )}
                    </div>
                    <div className="post-description">
                      <button
                        style={{ border: "none", padding: 8 }}
                        onClick={() => {
                          if (post.likes?.includes(`${user?._id}`)) {
                            socket?.emit("unlike-post", {
                              post_id: post._id,
                              user_id: user?._id,
                            });
                          } else {
                            socket?.emit("like-post", {
                              post_id: post._id,
                              user_id: user?._id,
                            });
                          }
                        }}
                      >
                        {post.likes.includes(`${user?._id}`) ? (
                          <Icon
                            icon="mdi:like"
                            style={{ fontSize: 20, color: " #17A9FD" }}
                          />
                        ) : (
                          <Icon icon="ei:like" style={{ fontSize: 26 }} />
                        )}
                        {post.likes.length} Likes
                      </button>
                      <button
                        // onClick={() => setShowCommentDialog(true)}
                        style={{ border: "none", marginLeft: 8, padding: 8 }}
                      >
                        <Icon
                          icon="teenyicons:chat-outline"
                          style={{ fontSize: 16, marginRight: 8 }}
                        />
                        {post.comments.length} Comments
                      </button>
                    </div>
                    <div className="post-footer">
                      <CommentComponent {...post} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
