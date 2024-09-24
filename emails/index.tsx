// import Logo from "@/components/global/Logo";
import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

export interface InviteEmailTemplateProps {
  firstName?: string;
  userImage?: string;
  invitedByUsername?: string;
  invitedByEmail?: string;
  teamName?: string;
  teamImage?: string;
  inviteLink?: string;
  inviteFromIp?: string;
  inviteFromLocation?: string;
  role?: string;
  password: string;
  loginEmail: string;
}
export const InviteEmailTemplate = ({
  firstName,
  password,
  invitedByUsername,
  invitedByEmail,
  loginEmail,
  role,
  inviteLink,
}: InviteEmailTemplateProps) => {
  const previewText = `Join MMA Inventory Management System as${role}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px] flex items-center justify-center">
              {/* <Logo /> */}
              <strong>MMA</strong> Inventory Management System
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Welcome to <strong>MMA</strong> Inventory Management System
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello {firstName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              <strong>{invitedByUsername}</strong> (
              <Link
                href={`mailto:${invitedByEmail}`}
                className="text-blue-600 no-underline"
              >
                {invitedByEmail}
              </Link>
              ) has invited you to join <strong>MMA</strong> as{" "}
              <strong>{role}</strong>.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              We are pleased to inform you that you have been granted access to
              our Inventory Management System. Below are your login credentials
              and a link to access the system.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Login Credentials:
              <Hr />
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              <strong>Username</strong>: {loginEmail}
              <Hr />
              <strong>Temporary Password</strong>: {password}
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Please follow the link below to log in and set your permanent
              password:
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={inviteLink}
              >
                Login Here
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              or copy and paste this URL into your browser:{" "}
              <Link href={inviteLink} className="text-blue-600 no-underline">
                {inviteLink}
              </Link>
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

// VercelInviteUserEmail.PreviewProps = {
//   username: "alanturing",
//   userImage: `${baseUrl}/static/vercel-user.png`,
//   invitedByUsername: "Alan",
//   invitedByEmail: "alan.turing@example.com",
//   teamName: "Enigma",
//   teamImage: `${baseUrl}/static/vercel-team.png`,
//   inviteLink: "https://vercel.com/teams/invite/foo",
//   inviteFromIp: "204.13.186.218",
//   inviteFromLocation: "São Paulo, Brazil",
// } as VercelInviteUserEmailProps;

export default InviteEmailTemplate;
