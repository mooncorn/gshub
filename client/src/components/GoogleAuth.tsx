import axios, { AxiosError } from "axios";
import { useContext, useEffect } from "react";
import { AuthContext, GetUserResponseData } from "./AuthContext";

interface SignInResponseData extends GetUserResponseData {
  Token: string;
}

export default function GoogleAuth() {
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });
      window.google.accounts.id.renderButton(
        document.getElementById("signInDiv")!,
        { theme: "outline", size: "large" }
      );
    };

    const handleCredentialResponse = async (response: any) => {
      const idToken = response.credential;

      try {
        const res = await axios.post<SignInResponseData>(
          "http://localhost:8080/signin",
          { idToken }
        );

        login(res.data.Token, {
          id: res.data.User.Id,
          email: res.data.User.Email,
          name: res.data.User.Name,
          picture: res.data.User.Picture,
        });
      } catch (e) {
        if (e instanceof AxiosError) {
          console.log("Sign in failed.", e);
        }
      }
    };

    if (window.google && window.google.accounts) {
      initializeGoogleSignIn();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div>
      <div id="signInDiv"></div>
    </div>
  );
}
