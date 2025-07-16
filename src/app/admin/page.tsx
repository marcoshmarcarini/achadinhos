import Form from "@/components/Admin/Form/page";
import Table from "@/components/Admin/Table/page";

export default function Admin() {
  return (
    <div className={`flex flex-col gap-[50px] px-5 py-5`}>
      <h1>Admin</h1>
      <Form />
      <Table />
    </div>
  );
}
