import { Html, Head, Font, Preview, Heading, Row, Section, Text, Button } from '@react-email/components';

interface VerificationEmailProps {
    fullName: string;
    email: string;
    otp: string;
}

export default function VerificationEmail({ fullName, email, otp }: VerificationEmailProps) {
    return (
        <Html lang="en" dir="ltr">
            <Head>
                <title>Verification Code</title>
                <Font
                    fontFamily="Roboto"
                    fallbackFontFamily="Verdana"
                    webFont={{
                        url: "https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=Irish+Grover&family=Lilita+One&family=Oswald:wght@200..700&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&family=Russo+One&display=swap",
                        format: "woff2"
                    }}
                    fontWeight={400}
                    fontStyle="normal"
                />
            </Head>

            <Preview>Here&apos;s your verification code: {otp}</Preview>

            <Section>
                <Row>
                    <Heading as="h2">Hello {fullName}</Heading>
                </Row>
                <Row>
                    <Text>
                        Thank you for signing up with us. Please use the following code to verify your email address for your registration.
                    </Text>
                </Row>
                <Row>
                    <Text>
                        Verification Code: {otp}
                    </Text>
                </Row>
                <Row>
                    <Text>
                        If you did not sign up for an account, please ignore this email.
                    </Text>
                </Row>
                <Row>
                    <Text>
                        This code will expire in 10 minutes.
                    </Text>
                </Row>
            </Section>

        </Html>
    );
}

