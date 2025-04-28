"use client";

import AssessmentForm from "@/components/AssessmentForm";
import FormWrapper from "@/components/ui/FormWrapper";
import { useAssessmentForm } from "@/hooks/useAssessmentForm";

export default function CreateOrganizationPage() {
  const {
    status,
    questions,
    responses,
    error,
    handleInputChange,
    handleSubmit,
  } = useAssessmentForm({
    questionEndpoint: "/flask-api/organization/questions",
    responseEndpoint: "/flask-api/organization/responses",
    saveEndpoint: "/flask-api/organization/save",
    onSuccessRedirect: "/initialize-site",
  });

  return (
    <FormWrapper status={status} questions={questions} error={error}>
      <AssessmentForm
        questions={questions}
        responses={responses}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        isConfirmationPage={false}
      />
    </FormWrapper>
  );
}
