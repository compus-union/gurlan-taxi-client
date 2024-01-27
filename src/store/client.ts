import { defineStore } from "pinia";
import { ref } from "vue";

interface Client {
  id: string;
  oneId: string;
  createdAt: Date;
  fullname: string;
  phone: string;
  password: string;
  bonus: string;
  moneySpent: string;
  rides: any[];
  status: string;
  ban: object;
  lastLogin: Date;
  deleted: boolean;
  bannedId: string;
  Approval: object;
  confirmation: object;
  approvalId: string;
  confirmationId: string;
}

export const useClient = defineStore("client-store", () => {
  const client = ref<Client>();

  async function setClient(payload: Client) {
    client.value = payload;
    return;
  }

  return { client, setClient };
});
