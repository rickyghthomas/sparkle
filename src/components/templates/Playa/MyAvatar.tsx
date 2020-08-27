import React, { useRef, useEffect, useState, useLayoutEffect } from "react";
import {
  UserState,
  UserStateKey,
  UserVideoState,
  stateBoolean,
} from "types/RelayMessage";
import { throttle } from "lodash";
import { PLAYA_WIDTH_AND_HEIGHT, PLAYA_AVATAR_SIZE } from "settings";
import { useUser } from "hooks/useUser";
import { Overlay } from "react-bootstrap";

interface PropsType {
  serverSentState: UserState | undefined;
  bike: boolean;
  videoState: string | undefined;
  sendUpdatedState: (state: UserState) => void;
  setMyLocation: (x: number, y: number) => void;
}

const ARROW_MOVE_INCREMENT_PX_WALK = 6;
const ARROW_MOVE_INCREMENT_PX_BIKE = 20;

export const MyAvatar: React.FunctionComponent<PropsType> = ({
  serverSentState,
  bike,
  videoState,
  sendUpdatedState,
  setMyLocation,
}) => {
  const { profile } = useUser();
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<UserState>();
  const stateInitialized = useRef(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (!serverSentState || stateInitialized.current) return;
    setState(serverSentState);
    setMyLocation(serverSentState.x, serverSentState.y);
    stateInitialized.current = true;
  }, [serverSentState, setMyLocation]);

  useLayoutEffect(() => {
    const pressedKeys: { [key: string]: boolean } = {};
    const keyListener = throttle((event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowLeft":
        case "ArrowRight":
        case "ArrowUp":
        case "ArrowDown":
          pressedKeys[event.key] = event.type === "keydown";
          break;
        default:
          return;
      }
      const moveIncrement = bike
        ? ARROW_MOVE_INCREMENT_PX_BIKE
        : ARROW_MOVE_INCREMENT_PX_WALK;
      setState((state) => {
        if (state) {
          let needsUpdate = false;
          // Work around possible bad state that can happen in the presence of scroll jank
          if (pressedKeys["ArrowLeft"] && pressedKeys["ArrowRight"]) {
            pressedKeys["ArrowLeft"] = false;
            pressedKeys["ArrowRight"] = false;
          }
          if (pressedKeys["ArrowUp"] && pressedKeys["ArrowDown"]) {
            pressedKeys["ArrowUp"] = false;
            pressedKeys["ArrowDown"] = false;
          }
          if (pressedKeys["ArrowLeft"]) {
            state.x = Math.max(0, state.x - moveIncrement);
            needsUpdate = true;
          }
          if (pressedKeys["ArrowRight"]) {
            state.x = Math.min(
              PLAYA_WIDTH_AND_HEIGHT - 1,
              state.x + moveIncrement
            );
            needsUpdate = true;
          }
          if (pressedKeys["ArrowUp"]) {
            state.y = Math.max(0, state.y - moveIncrement);
            needsUpdate = true;
          }
          if (pressedKeys["ArrowDown"]) {
            state.y = Math.min(
              PLAYA_WIDTH_AND_HEIGHT - 1,
              state.y + moveIncrement
            );
            needsUpdate = true;
          }
          if (needsUpdate) {
            sendUpdatedState(state);
          }
          return needsUpdate ? { ...state } : state;
        }
        return state;
      });
    }, 50);

    window.addEventListener("keydown", keyListener);
    window.addEventListener("keyup", keyListener);
    return () => {
      window.removeEventListener("keydown", keyListener);
      window.removeEventListener("keyup", keyListener);
    };
  }, [bike, sendUpdatedState]);

  useEffect(() => {
    setState((state) => {
      if (!state) return state;
      const onBike = state?.state?.[UserStateKey.Bike] === true.toString();
      const needsUpdate = bike !== onBike;
      if (!needsUpdate) return state;

      if (state.state) {
        state.state[UserStateKey.Bike] = bike.toString();
      }
      sendUpdatedState(state);
      return { ...state };
    });
  }, [bike, sendUpdatedState]);

  const setVideoChat = (value: UserVideoState) => {
    setState((state) => {
      if (!state) return;
      if (!state.state) state.state = {};
      if (state.state[UserStateKey.Video] === value) return state;

      state.state[UserStateKey.Video] = value;
      sendUpdatedState(state);
      return { ...state };
    });
  };

  if (!profile || !state) return <></>;

  const visible = stateBoolean(state?.state, UserStateKey.Visible) !== false;

  return visible ? (
    <>
      <div
        ref={ref}
        className="avatar me"
        style={{
          top: state.y - PLAYA_AVATAR_SIZE / 2,
          left: state.x - PLAYA_AVATAR_SIZE / 2,
        }}
        onMouseOver={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="border-helper">
          <span className="img-vcenter-helper" />
          <img
            className="profile-image"
            src={profile?.pictureUrl}
            alt={profile?.partyName}
            title={profile?.partyName}
          />
        </div>
      </div>
      <div
        className={`chatzone ${
          videoState === UserVideoState.Locked ? "locked" : ""
        }
        ${videoState === UserVideoState.Open ? "open" : ""}`}
        style={{
          top: state.y - PLAYA_AVATAR_SIZE * 1.5,
          left: state.x - PLAYA_AVATAR_SIZE * 1.5,
        }}
      />
      <div
        className={`mode-badge ${bike ? "bike" : "walk"}`}
        style={{
          top: state.y + PLAYA_AVATAR_SIZE / 3,
          left: state.x - PLAYA_AVATAR_SIZE / 4,
        }}
      />
      <Overlay target={ref.current} show={showTooltip}>
        {({ placement, arrowProps, show: _show, popper, ...props }) => (
          // @ts-expect-error
          <div {...props} style={{ ...props.style, padding: "10px" }}>
            <div className="playa-venue-text">
              <div className="playa-venue-maininfo">
                <div className="playa-user-title">
                  {profile?.partyName} (you)
                </div>
              </div>
            </div>
          </div>
        )}
      </Overlay>
    </>
  ) : (
    <></>
  );
};
