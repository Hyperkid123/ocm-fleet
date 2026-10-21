import "./SetupPage.scss";

import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  ClipboardCopy,
  Icon,
  Spinner,
  Title,
} from "@patternfly/react-core";
import { KeyIcon } from "@patternfly/react-icons";

import EnrollmentDL from "./components/EnrollmentDL";
import EnrollmentError from "./components/EnrollmentError";
import GHEnroll from "./components/GHEnroll";
import OIDCEnroll from "./components/OIDCEnroll";
import { EnrollStep, useSigningKeyEnrollment } from "./useSigningKeyEnrollment";

const messages: Record<string, string> = {
  loading: "Loading configuration...",
  generating: "Generating ECDSA P-256 signing key...",
  verifying: "Verifying signature with the server...",
};

interface SigningKeyEnrollmentProps {
  onSetupNext?: () => void;
  onSetupSkip?: () => void;
}

const SigningKeyEnrollment = ({
  onSetupNext,
  onSetupSkip,
}: SigningKeyEnrollmentProps) => {
  const {
    step,
    sshPublicKey,
    derPublicKey,
    publicKeyClaimExpression,
    registry,
    error,
    enrollmentName,
    githubUsername,
    ghPollEnabled,
    ghKeyError,
    enrollOidc,
    retry,
    handleReenroll,
    setGhPollEnabled,
  } = useSigningKeyEnrollment();
  const publicKey = registry === "github" ? sshPublicKey : derPublicKey;

  if (
    step === EnrollStep.Loading ||
    step === EnrollStep.Generating ||
    step === EnrollStep.Verifying
  ) {
    return (
      <div className="ocm-fleet-signing-setup">
        <Title headingLevel="h1" className="ocm-fleet-signing-setup__title">
          Signing Key Enrollment
        </Title>
        <Spinner aria-label={messages[step]} />
        <p className="pf-v6-u-mt-md">{messages[step]}</p>
      </div>
    );
  }

  if (step === EnrollStep.Error) {
    return <EnrollmentError error={error} onRetry={retry} />;
  }

  return (
    <div className="ocm-fleet-signing-setup">
      <Title headingLevel="h1" className="ocm-fleet-signing-setup__title">
        Signing Key Enrollment
      </Title>

      {step === EnrollStep.Enrolled ? (
        <>
          <Alert
            variant="success"
            isInline
            title="Signing key enrolled and verified"
          >
            <EnrollmentDL
              registry={registry}
              enrollmentName={enrollmentName}
              publicKey={publicKey}
            />
          </Alert>
          <div className="pf-v6-u-mt-xl">
            {onSetupNext && (
              <Button
                variant="primary"
                onClick={onSetupNext}
                className="pf-v6-u-mr-md"
              >
                Continue
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={handleReenroll}
              className="pf-v6-u-mr-md"
            >
              Re-enroll
            </Button>
            {onSetupSkip && (
              <Button variant="link" onClick={onSetupSkip}>
                Skip to console
              </Button>
            )}
          </div>
        </>
      ) : (
        <>
          <p className="ocm-fleet-signing-setup__subtitle">
            Register your signing key to sign deployments and policies.
          </p>

          <Card isCompact className="pf-v6-u-mt-lg">
            <CardHeader>
              <CardTitle>
                <Icon>
                  <KeyIcon />
                </Icon>{" "}
                {registry === "github"
                  ? "Your SSH signing key"
                  : "Your signing public key (base64 DER/SPKI)"}
              </CardTitle>
            </CardHeader>
            <CardBody>
              {publicKey && (
                <ClipboardCopy isReadOnly isCode>
                  {publicKey}
                </ClipboardCopy>
              )}
            </CardBody>
          </Card>

          {registry === "github" && (
            <GHEnroll
              githubUsername={githubUsername}
              setGhPollEnabled={setGhPollEnabled}
              ghPollEnabled={ghPollEnabled}
              ghKeyError={ghKeyError}
            />
          )}

          {registry === "oidc" && (
            <OIDCEnroll
              step={step}
              enrollOidc={enrollOidc}
              publicKeyClaimExpression={publicKeyClaimExpression}
            />
          )}

          {onSetupSkip && (
            <Button
              variant="link"
              onClick={onSetupSkip}
              className="pf-v6-u-mt-xl"
            >
              Skip to console
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default SigningKeyEnrollment;
