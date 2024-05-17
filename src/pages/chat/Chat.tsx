/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import Page from "components/Page";
import { useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "src/redux/hooks";
import { setSnack } from "src/redux/reducers/snack.reducer";
import { convertStyleToReact } from "utils/helper.function";
import { useNavigate } from "react-router-dom";
import { ChatType } from "utils/types/chat.types";
import { get } from "lodash";
import { Icon } from "@iconify/react";
import moment from "moment";
import { Modal } from "react-bootstrap";

export default function Chat() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [activeUser, setActiveUser] = useState("");
  const [showMediaDialog, setShowMediaDialog] = useState(false);
  const { user, socket, chats } = useAppSelector((state) => ({
    user: state.auth.user,
    chats: state.chats.chats,
    socket: state.socket.socket,
  }));

  const [chatMessage, setChatMessage] = useState("");
  const [media, setMedia] = useState<any>(null);

  const handleActiveUser = async (email: string) => {
    setActiveUser(email);
    navigate(`/chat?selected=${email}`);
    if (socket) {
      socket.emit("get-messages-request", {
        sender: user?.email,
        receiver: email,
      });
    }
  };

  function convertFileToDataURL(file: any) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  async function handleChatMessage(data: any) {
    let chatObj: any = {
      sender: user?.email,
      receiver: activeUser,
      message: data,
      type: "text",
    };
    if (media) {
      chatObj = {
        ...chatObj,
        media: {
          type: media?.type,
          file: media?.file,
          name: media?.file?.name,
        },
        type: media?.type?.includes("image")
          ? "image"
          : media?.type?.includes("video")
          ? "video"
          : "text",
      };
      try {
        const formData = new FormData();
        formData.append("file", media.file);
        const backendServer = `${import.meta.env.VITE_express_server}`;
        const { data } = await axios.post(`${backendServer}/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        chatObj = {
          ...chatObj,
          type: media.type,
          media: data.fileUrl,
        };
      } catch (error: any) {
        dispatch(
          setSnack({ type: "error", message: error.message, open: true })
        );
      }
    }
    socket?.emit("send-message-request", chatObj);
    setChatMessage("");
    setShowMediaDialog(false);
    setMedia(null);
  }
  return (
    <Page title="chat">
      <Modal
        maxWidth="sm"
        fullWidth
        show={showMediaDialog}
        onHide={() => {
          setShowMediaDialog(false);
          setMedia(null);
        }}
      >
        <Modal.Header>
          <Modal.Title>Upload media</Modal.Title>
        </Modal.Header>
        {media && (
          <>
            {media.type.includes("image") ? (
              <img src={media.url} width="100%" height={300} />
            ) : (
              <video src={media.url} width="100%" height={300} controls></video>
            )}
          </>
        )}
        <input
          className="form-control p-3"
          id="textAreaExample2"
          value={chatMessage}
          onChange={(e) => setChatMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleChatMessage(get(e, "target.value", ""));
            }
          }}
          placeholder="Type a message"
        />
      </Modal>
      <section>
        <div className="container">
          <div className="row">
            <div className="col-md-6 col-lg-5 col-xl-4 mb-4 mb-md-0">
              <h5 className="font-weight-bold mb-3 text-center text-lg-start">
                Friends
              </h5>

              <div className="card">
                <div className="card-body">
                  <ul className="list-unstyled mb-0">
                    {user?.friends.map((friend) => (
                      <li
                        key={friend._id}
                        onClick={() => handleActiveUser(friend.email)}
                        className="p-2 border-bottom"
                        style={convertStyleToReact("background-color: #eee;")}
                      >
                        <a href="#!" className="d-flex justify-content-between">
                          <div className="d-flex flex-row">
                            <img
                              src={
                                friend.photoURL ||
                                "https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-8.webp"
                              }
                              alt="avatar"
                              className="shadow-1-strong"
                              width="60"
                            />
                            <div className="pt-1 ms-3">
                              <p className="fw-bold mb-0">
                                {friend.displayName}
                              </p>
                              <p className="small text-muted">{friend.email}</p>
                            </div>
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-7 col-xl-8">
              <ul
                className="list-unstyled"
                style={{ maxHeight: "70vh", overflowY: "auto" }}
              >
                {chats.map((chat: ChatType) => {
                  const friend = user?.friends.find(
                    (item) => item.email === chat.sender
                  );
                  return chat.sender === user?.email ? (
                    <li
                      key={chat._id}
                      className="d-flex justify-content-between mb-4"
                    >
                      <img
                        src={
                          user.photoURL ||
                          "https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-8.webp"
                        }
                        alt="avatar"
                        style={{
                          maxHeight: 50,
                          maxWidth: 50,
                          borderRadius: "50%",
                          marginRight: 16,
                        }}
                        className="mr-3 shadow-1-strong"
                        width="60"
                      />
                      <div className="card" style={{ minWidth: "50%" }}>
                        <div className="card-header d-flex justify-content-between p-3">
                          <p className="fw-bold mb-0">YOU</p>
                          <p className="text-muted small mb-0">
                            {moment(chat.timestamp).fromNow()}
                          </p>
                        </div>
                        <div className="card-body">
                          {chat.media && chat.type.includes("image") && (
                            <img
                              style={{
                                width: 200,
                                height: 200,
                                objectFit: "cover",
                                borderRadius: 8,
                              }}
                              src={chat.media}
                              alt={chat.message}
                            />
                          )}
                          {chat.media && chat.type.includes("video") && (
                            <video
                              style={{
                                width: 200,
                                height: 200,
                                objectFit: "cover",
                                borderRadius: 8,
                              }}
                              controls
                              src={chat.media}
                            />
                          )}
                          <p className="mb-0">{chat.message}</p>
                        </div>
                      </div>
                    </li>
                  ) : (
                    <li
                      key={chat._id}
                      className="d-flex justify-content-between mb-4"
                    >
                      <div className="card w-100">
                        <div className="card-header d-flex justify-content-between p-3">
                          <p className="fw-bold mb-0">{friend?.displayName}</p>
                          <p className="text-muted small mb-0">
                            {moment(chat.timestamp).fromNow()}
                          </p>
                        </div>
                        <div className="card-body">
                          {chat.media && chat.type.includes("image") && (
                            <img
                              style={{
                                width: 200,
                                height: 200,
                                objectFit: "cover",
                                borderRadius: 8,
                              }}
                              src={chat.media}
                              alt={chat.message}
                            />
                          )}
                          {chat.media && chat.type.includes("video") && (
                            <video
                              style={{
                                width: 200,
                                height: 200,
                                objectFit: "cover",
                                borderRadius: 8,
                              }}
                              controls
                              src={chat.media}
                            />
                          )}
                          <p className="mb-0">{chat.message}</p>
                        </div>
                      </div>
                      <img
                        src={
                          friend?.photoURL ||
                          "https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-5.webp"
                        }
                        alt="avatar"
                        style={{
                          maxHeight: 50,
                          maxWidth: 50,
                          borderRadius: "50%",
                        }}
                        className="ms-3 shadow-1-strong"
                        width="60"
                      />
                    </li>
                  );
                })}
              </ul>
              <div>
                <div className="form-outline">
                  <input
                    type="file"
                    ref={photoInputRef}
                    accept="image/*"
                    style={{ display: "none" }}
                    id="image"
                    onChange={async (e) => {
                      const file: any = get(e, "target.files[0]", null);
                      if (file) {
                        const url = await convertFileToDataURL(file);
                        setMedia({
                          url,
                          type: file.type,
                          file,
                        });
                        setShowMediaDialog(true);
                      }
                    }}
                  />
                  <input
                    type="file"
                    ref={videoInputRef}
                    accept="video/*"
                    style={{ display: "none" }}
                    id="video"
                    onChange={async (e) => {
                      const file: any = get(e, "target.files[0]", null);
                      try {
                        if (file) {
                          const url = await convertFileToDataURL(file);
                          setMedia({
                            url,
                            type: file.type,
                            file,
                          });
                          setShowMediaDialog(true);
                        }
                      } catch (error: any) {
                        console.log(error.message);
                      }
                    }}
                    onAbort={(e) => {
                      console.log(e);
                    }}
                  />
                  <div className="d-flex mb-2">
                    <button
                      className="border-0"
                      onClick={() => videoInputRef.current?.click()}
                    >
                      <Icon
                        style={{ fontSize: 24 }}
                        icon="mingcute:video-fill"
                      />
                    </button>
                    <button
                      className="border-0 ms-2"
                      onClick={() => photoInputRef.current?.click()}
                    >
                      <Icon style={{ fontSize: 24 }} icon="ic:outline-image" />
                    </button>
                  </div>
                  <input
                    className="form-control p-3"
                    id="textAreaExample2"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleChatMessage(get(e, "target.value", ""));
                      }
                    }}
                    placeholder="Type a message"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Page>
  );
}
