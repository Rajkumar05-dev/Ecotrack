package StreamApi;

import java.util.Arrays;
import java.util.List;

public class CountElements {
public static void main(String[] args) {
	List<String> list = Arrays.asList("raj","amit","rohit");
long alist = list.stream().count();
System.out.println(alist);

}
}
