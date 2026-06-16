import { Topbar } from "@/components/topbar";
import { NewCourseForm } from "@/components/admin/new-course-form";

export default function NewCoursePage() {
  return (
    <div>
      <Topbar title="New Course" subtitle="Create a new course for the platform" titleAr="كورس جديد" subtitleAr="إنشاء كورس جديد للمنصة" />
      <div className="p-4 sm:p-6 lg:p-8">
        <NewCourseForm />
      </div>
    </div>
  );
}
