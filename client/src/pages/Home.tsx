import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to chat page immediately
    setLocation("/chat");
  }, [setLocation]);

  return null;
}
