import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Form,
  Input,
  Label,
  Link,
  Popover,
  TextField,
} from "@heroui/react";
import React, { useState } from "react";

import api from "@/lib/axios";
import DefaultLayout from "@/layouts/default";

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user.role.toUpperCase());

      alert(`Welcome back, ${user.name}!`);

      const userRole = user.role.toUpperCase();

      if (userRole === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/archives");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DefaultLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center min-h-[calc(100vh-180px)] p-6 lg:p-10">
        <div className="hidden lg:flex flex-col lg:col-span-2 space-y-8 animate-in fade-in duration-1000">
          <div className="space-y-4">
            <h1 className="text-7xl font-extrabold tracking-tighter leading-none">
              Archivio <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent brightness-125 saturate-150 drop-shadow-sm">
                Digital Archive
              </span>
            </h1>
            <p className="text-sm text-default-500 max-w-xl leading-relaxed">
              Smart archiving solutions designed for speed, security, and ease
              of access in the digital age.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 w-12 rounded-full border-4 border-background bg-default-200 flex items-center justify-center text-xs font-bold"
                >
                  U{i}
                </div>
              ))}
            </div>
            <p className="text-sm text-default-400">
              Trusted by dozens of agencies to manage thousands of documents
              every day.
            </p>
          </div>
        </div>

        <div className="lg:col-span-1 w-full flex justify-center lg:justify-end animate-in fade-in slide-in-from-right duration-700">
          <Card className="h-auto w-full max-w-[380px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-none bg-content1/80 backdrop-blur-2xl p-2 rounded-[32px]">
            <Card.Header className="flex flex-col items-center justify-center pt-8 pb-1 gap-1">
              <Card.Title className="text-3xl font-bold tracking-tight text-center">
                Sign In
              </Card.Title>
            </Card.Header>
            <Card.Content className="px-6 py-4">
              <Form className="flex flex-col gap-4" onSubmit={onSubmit}>
                <TextField isRequired name="email" type="email">
                  <Label className="text-xs font-bold ml-1">Email</Label>
                  <Input
                    className="h-10"
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </TextField>

                <TextField isRequired name="password" type="password">
                  <Label className="text-xs font-bold ml-1">Password</Label>
                  <Input
                    className="h-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </TextField>

                {error && (
                  <p className="text-danger text-[11px] font-bold text-center bg-danger/10 p-2 rounded-lg">
                    {error}
                  </p>
                )}

                <div className="flex justify-between items-center px-1">
                  <Link
                    className="text-[11px] font-bold text-primary underline"
                    href="#"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <Button
                  className="w-full font-bold h-11 mt-2 text-base shadow-lg shadow-blue-500/20 rounded-xl"
                  type="submit"
                  variant="primary"
                >
                  {loading ? "Connecting..." : "Sign In Now"}
                </Button>
              </Form>
            </Card.Content>
            <Card.Footer className="justify-center pb-8 pt-1">
              <div className="text-xs text-default-500">
                Don&apos;t have an account?{" "}
                <Popover>
                  <Popover.Trigger>
                    <Link className="font-bold text-primary hover:underline ml-1 cursor-pointer">
                      Contact Admin
                    </Link>
                  </Popover.Trigger>
                  <Popover.Content className="max-w-64">
                    <Popover.Dialog className="p-4 outline-none">
                      <Popover.Heading className="text-sm align-center font-bold mb-2">
                        Contact Support
                      </Popover.Heading>
                      <p className="text-xs text-default-500 leading-relaxed">
                        Contact the admin if you need help logging in or
                        anything about this app,{" "}
                        <a
                          className="text-primary hover:underline font-bold"
                          href="https://wa.me/6285134394748?text=Hello%20admin,%20I%20need%20help%20logging%20in%20to%20the%20app"
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          contact admin
                        </a>
                      </p>
                    </Popover.Dialog>
                  </Popover.Content>
                </Popover>
              </div>
            </Card.Footer>
          </Card>
        </div>
      </div>
    </DefaultLayout>
  );
}
