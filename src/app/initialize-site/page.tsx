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
    questionEndpoint: "/flask-api/site/questions",
    responseEndpoint: "/flask-api/site/responses",
    saveEndpoint: "/flask-api/site/save",
    onSuccessRedirect: "/",
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
