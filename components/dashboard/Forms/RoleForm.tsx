"use client";
import { Card, CardContent } from "@/components/ui/card";

import FormHeader from "./FormHeader";
import { useRouter } from "next/navigation";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { RoleProps } from "@/types/types";
import TextInput from "@/components/global/FormInputs/TextInput";

import toast from "react-hot-toast";

import { Role, Unit } from "@prisma/client";
import { permissions } from "@/config/permissions";
import FormFooter from "./FormFooter";
import { createRoleName } from "@/lib/createRoleName";
import { createRole, updateRoleById } from "@/actions/roles";

type RoleFormProps = {
  editingId?: string | undefined;
  initialData?: Role | undefined | null;
};

export default function RoleForm({ editingId, initialData }: RoleFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Role>({
    defaultValues: {
      ...initialData,
    },
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function saveRole(data: Role) {
    data.roleName = createRoleName(data.displayName);
    const { id, createdAt, updatedAt, ...others } = data;
    try {
      setLoading(true);
      data.roleName = createRoleName(data.displayName);
      if (editingId) {
        await updateRoleById(editingId, others as RoleProps);
        setLoading(false);
        toast.success("Updated Successfully!");
        reset();
        router.push("/dashboard/users/roles");
      } else {
        await createRole(others as RoleProps);
        setLoading(false);
        // console.log(others);
        toast.success("Successfully Created!");
        reset();
        router.push("/dashboard/users/roles");
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }

  return (
    <form className="" onSubmit={handleSubmit(saveRole)}>
      {/* Form content */}
      <FormHeader
        href="/roles"
        title="Role"
        parent="users"
        editingId={editingId}
        loading={loading}
      />
      <div className="max-w-4xl mx-auto space-y-6 py-8">
        <Card>
          <CardContent>
            <div className="grid  gap-6">
              <div className="grid gap-3 pt-4 grid-cols-1 md:grid-cols-2">
                <TextInput
                  register={register}
                  errors={errors}
                  label="Role Name"
                  name="displayName"
                />
                <TextInput
                  register={register}
                  errors={errors}
                  label="Role Description"
                  name="description"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h2 className="pt-4 font-medium">
              Select the Pages the User will have access
            </h2>
            <div className="grid grid-cols-4 gap-6 pt-6">
              {permissions.map((permission, index) => (
                <div className="flex items-center space-x-8" key={index}>
                  <ul className="items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:flex">
                    <li
                      key={index}
                      className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600"
                    >
                      <div className="flex items-center ps-3">
                        <input
                          id={permission.name}
                          type="checkbox"
                          {...register(`${permission.name}` as any)}
                          name={permission.name}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                        />
                        <label
                          htmlFor={permission.name}
                          className="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                        >
                          {permission.display}
                        </label>
                      </div>
                    </li>
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Form footer */}
      <FormFooter
        href="/roles"
        editingId={editingId}
        loading={loading}
        title="Role"
        parent="users"
      />
    </form>
  );
}
