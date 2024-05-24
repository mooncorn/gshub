import axios, { AxiosError } from "axios";
import { useContext } from "react";
import { AuthContext, GetUserResponseData } from "./AuthContext";
import { GoogleLogin } from "@react-oauth/google";

interface SignInResponseData extends GetUserResponseData {
  Token: string;
}

export default function GoogleLoginButton() {
  const { login } = useContext(AuthContext);

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

  return <GoogleLogin onSuccess={handleCredentialResponse} />;
}
