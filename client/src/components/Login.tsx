import React, { useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

const Login: React.FC = () => {
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse
      });
      window.google.accounts.id.renderButton(
        document.getElementById('signInDiv')!,
        { theme: 'outline', size: 'large' }
      );
    };

    const handleCredentialResponse = (response: any) => {
      const idToken = response.credential;
      fetch('http://localhost:8080/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idToken })
      })
      .then(response => response.json())
      .then(data => {
        const { Name, Picture } = data.user;
        login(data.token, { name: Name, picture: Picture });
        // Redirect or perform any other actions
      });
    };

    if (window.google && window.google.accounts) {
      initializeGoogleSignIn();
    } else {
      const script = document.createElement('script');
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.body.appendChild(script);
    }
  }, [login]);

  return (
    <div>
      <div id="signInDiv"></div>
    </div>
  );
};

export default Login;
