import React, { Component } from "react";

// font-awesome 아이콘 구현
import { Link, withRouter } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF } from "@fortawesome/free-brands-svg-icons";

import kakaoImg from "Img/Kakao.png";
import "./SignupRight.scss";
import { SERVER_URL } from "config";

class SignupRight extends Component {
  state = {
    id: "",
    pwd: "",
    isLoggedIn: false,
    userID: "",
    name: "",
    email: "",
    picture: ""
  };
  componentDidMount = () => {
    !window.Kakao.Auth && window.Kakao.init("f6b88303f2a59f0e0bd1fc1dad652f65");
    this.googleSDK();
    this.facebookSDK();
  };

  facebookSDK = () => {
    // SDK 초기 설정
    window.fbAsyncInit = function() {
      window.FB.init({
        appId: "190913902011069",
        autoLogAppEvents: true,
        cookie: true,
        xfbml: true,
        version: "v6.0"
      });
      //  로그인 상태 체크
      window.FB.getLoginStatus(function(response) {
        if (response.status === "connected") {
          let uid = response.authResponse.userID;
          let accessToken = response.authResponse.accessToken;
          console.log(response);
        } else if (response.status === "not_authorized") {
          console.log(response);
        } else {
          console.log(response);
        }
      });
    };
    // 페이스북 SDK 로드
    (function(d, s, id) {
      // Load the SDK asynchronously
      var js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s);
      js.id = id;
      js.src = "https://connect.facebook.net/ko_KR/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
  };

  googleSDK = () => {
    // 구글 SDK 초기 설정
    window["googleSDKLoaded"] = () => {
      window["gapi"].load("auth2", () => {
        this.auth2 = window["gapi"].auth2.init({
          client_id:
            "628358554769-at7m9m99q7aqc20ih44nrh7b5sqim8rk.apps.googleusercontent.com",
          scope: "profile email"
        });
        this.loginWithGoogle();
      });
    };

    (function(d, s, id) {
      var js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = "https://apis.google.com/js/platform.js?onload=googleSDKLoaded";
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "google-jssdk");
  };

  //구글 로그인
  loginWithGoogle = () => {
    this.auth2.attachClickHandler(
      this.refs.googleLoginBtn,
      {},
      googleUser => {
        let profile = googleUser.getBasicProfile();
        console.log("Token || " + googleUser.getAuthResponse().id_token);
        console.log("ID: " + profile.getId());
        console.log("Name: " + profile.getName());
        console.log("Image URL: " + profile.getImageUrl());
        console.log("Email: " + profile.getEmail());
      },
      error => {
        alert(JSON.stringify(error, undefined, 2));
      }
    );
  };

  //페이스북 로그인
  signinWithFacebook = () => {
    // 유저의 정보를 불러옴
    window.FB.login(function(response) {
      console.log(response);
      window.FB.api("/me", "GET", { fields: "email" }, function(response) {
        console.log(response);
      });
    });
  };

  // 커스텀 버튼에 사용하는 카카오 버튼
  signinWithKakao = () => {
    window.Kakao.Auth.login({
      success: authObj => {
        this.setState(
          {
            kakaoToken: authObj.access_token
          },
          () => {
            fetch(`${SERVER_URL}/user/kakao/sign-in`, {
              method: "GET",
              headers: {
                Authorization: this.state.kakaoToken
              }
            })
              .then(res => res.json())
              .then(res => {
                if (res.user_info) {
                  localStorage.setItem("kakao_id", res.user_info.kakao_id);
                  localStorage.setItem("kakao_email", res.user_info.email);
                  this.props.history.push("/signupinfo");
                }
              });
          }
        );
      },
      fail: function(err) {
        console.log("에러", err);
      }
    });
  };

  render() {
    return (
      <div className="signup_main_right">
        <ul>
          <li>
            <button onClick={this.signinWithFacebook}>
              <FontAwesomeIcon
                icon={faFacebookF}
                size="2x"
                style={{ margin: "0 10px" }}
              />
              <div>
                <span>페이스북으로 가입하기</span>
              </div>
            </button>
          </li>
          <li>
            <button
              onClick={this.signinWithKakao}
              style={{ backgroundColor: "#FAE100", color: "black" }}
            >
              <img className="kakao_img" src={kakaoImg} alt="kakao" />
              <div>
                <span>카카오계정으로 가입하기</span>
              </div>
            </button>
            {/* <a id="kakao-login-btn"></a> */}
          </li>
          <li>
            <button
              onClick={this.prepareLoginButton}
              style={{ backgroundColor: "white" }}
              className="googleLoginBtn"
              ref="googleLoginBtn"
            >
              <img
                alt="google"
                style={{
                  width: "35px",
                  backgroundColor: "white",
                  padding: "0 3px"
                }}
                src="https://pbs.twimg.com/profile_images/770139154898382848/ndFg-IDH_400x400.jpg"
              />
              <div style={{ border: "none", color: "gray" }}>
                <span>구글로 가입하기</span>
              </div>
            </button>
          </li>
        </ul>
      </div>
    );
  }
}

export default withRouter(SignupRight);
