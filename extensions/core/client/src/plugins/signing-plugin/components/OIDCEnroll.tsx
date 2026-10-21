import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from "@patternfly/react-core";

import { EnrollStep } from "../enrollmentReducer";

export type OIDCEnrollProps = {
  step: EnrollStep;
  enrollOidc: () => void;
  publicKeyClaimExpression?: string;
};

const OIDCEnroll = ({
  step,
  enrollOidc,
  publicKeyClaimExpression,
}: OIDCEnrollProps) => {
  return (
    <Card isCompact className="pf-v6-u-mt-lg">
      <CardHeader>
        <CardTitle>Provision your OIDC signing claim</CardTitle>
      </CardHeader>
      <CardBody>
        <p>
          Ask your identity provider administrator to provision the base64
          DER/SPKI key above in your ID token signing claim. OIDC does not
          standardize profile writes; this console does not update your
          provider.
        </p>
        {publicKeyClaimExpression ? (
          <p className="pf-v6-u-mt-md">
            Public-key claim CEL expression:{" "}
            <code>{publicKeyClaimExpression}</code>.
          </p>
        ) : (
          <Alert
            isInline
            variant="warning"
            title="Signing claim not configured"
            className="pf-v6-u-mt-md"
          >
            Ask your platform administrator to configure the public-key claim
            CEL expression before enrolling.
          </Alert>
        )}
        <Alert
          isInline
          variant="info"
          title="Provider signing support required"
          className="pf-v6-u-mt-md"
        >
          Your provider must support the signing claim and session renewal with
          an ID token. Enrollment verifies a test signature after renewal.
        </Alert>
        <Button
          variant="primary"
          isLoading={step === EnrollStep.Enrolling}
          isDisabled={
            step === EnrollStep.Enrolling || !publicKeyClaimExpression
          }
          onClick={enrollOidc}
          className="pf-v6-u-mt-sm"
        >
          Enroll signing key
        </Button>
      </CardBody>
    </Card>
  );
};

export default OIDCEnroll;
