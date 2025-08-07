import React, { useState } from "react";
import { Button } from "../ui/button";
import { IUser } from "@/types/types";
import { inviteUser } from "@/actions/emails";
import { InviteEmailTemplateProps } from "@/emails";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function InviteUser({ user }: { user: IUser }) {
  const [loading, setLoading] = useState(false);
  const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/login`;
  async function sendInvite() {
    setLoading(true);
    try {
      const data: InviteEmailTemplateProps = {
        firstName: user.firstName,
        password: user.plainPassword ?? "",
        invitedByUsername: "JB WEB DEVELOPER",
        invitedByEmail: "jb@Africa Pharmacy.com",
        loginEmail: user.email,
        role: user.role.displayName,
        inviteLink: baseUrl,
      };
      await inviteUser(data);
      toast.success("Invite Sent successfully");
      setLoading(false);
      // window.reload()
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }
  return (
    <div className="">
      {loading ? (
        <Button disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sending please wait...
        </Button>
      ) : (
        <Button
          // disabled={user.inviteSent}
          onClick={sendInvite}
          size={"sm"}
          variant={user.inviteSent ? "destructive" : "outline"}
        >
          {user.inviteSent ? "Invite Again" : "Invite User"}
        </Button>
      )}
    </div>
  );
}
