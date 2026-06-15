package StreamApi;

import java.util.Arrays;
import java.util.List;

public class CheckIfNoNumberIsNegative {
public static void main(String[] args) {
	List<Integer> list = Arrays.asList(10, 50, 30, 20, 70, 40, 60);
	boolean result = list.stream().noneMatch(n->n<0);
	System.out.println(result);
}
}
