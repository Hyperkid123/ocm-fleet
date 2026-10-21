import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import { ReactNode } from "react";

export type EnrollmentDLProps = {
  enrollmentName?: ReactNode;
  registry: "github" | "oidc";
  publicKey?: string | null;
};

const EnrollmentDL = ({
  enrollmentName,
  registry,
  publicKey,
}: EnrollmentDLProps) => {
  return (
    <DescriptionList isCompact isHorizontal>
      {enrollmentName && (
        <DescriptionListGroup>
          <DescriptionListTerm>Enrollment</DescriptionListTerm>
          <DescriptionListDescription>
            {enrollmentName}
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
      <DescriptionListGroup>
        <DescriptionListTerm>Registry</DescriptionListTerm>
        <DescriptionListDescription>
          {registry === "github"
            ? "GitHub SSH signing keys"
            : "OIDC ID token signing claim"}
        </DescriptionListDescription>
      </DescriptionListGroup>
      {publicKey && (
        <DescriptionListGroup>
          <DescriptionListTerm>Public key</DescriptionListTerm>
          <DescriptionListDescription>
            <code className="ocm-fleet-signing-setup__pubkey-snippet">
              {publicKey.slice(0, 60)}...
            </code>
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
    </DescriptionList>
  );
};

export default EnrollmentDL;
